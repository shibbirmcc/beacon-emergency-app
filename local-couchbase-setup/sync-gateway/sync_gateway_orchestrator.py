#!/usr/bin/env python3
import subprocess
import time
import requests
import sys
import os

CONFIG_TEMPLATE = '/etc/sync_gateway/config.json.template'
CONFIG_FILE = '/etc/sync_gateway/config.json'

# Read clusters list from environment
clusters_env = os.environ.get('CLUSTERS')
if not clusters_env:
    print("[ERROR] CLUSTERS environment variable must be set!")
    sys.exit(1)

CLUSTERS = [c.strip() for c in clusters_env.split(',') if c.strip()]
if not CLUSTERS:
    print("[ERROR] CLUSTERS variable is empty or invalid!")
    sys.exit(1)

COUCHBASE_USERNAME = os.environ.get('COUCHBASE_USERNAME')
COUCHBASE_PASSWORD = os.environ.get('COUCHBASE_PASSWORD')

if not COUCHBASE_USERNAME or not COUCHBASE_PASSWORD:
    print("[ERROR] COUCHBASE_USERNAME and COUCHBASE_PASSWORD must be set!")
    sys.exit(1)


SYNC_GATEWAY_CMD = [ '/opt/couchbase-sync-gateway/bin/sync_gateway', CONFIG_FILE]

def generate_config(cluster_host):
    couchbase_server = f"couchbase://{cluster_host.split(':')[0]}"
    print(f"[INFO] Generating config for Couchbase server: {couchbase_server}")
    with open(CONFIG_TEMPLATE, 'r') as f:
        config = f.read().replace('${COUCHBASE_SERVER}', couchbase_server)
    with open(CONFIG_FILE, 'w') as f:
        f.write(config)
    print("[INFO] Config generated.")

def start_sync_gateway():
    print("[INFO] Starting Sync Gateway...")
    process = subprocess.Popen(SYNC_GATEWAY_CMD)
    return process

def stop_sync_gateway(process):
    print("[INFO] Stopping Sync Gateway...")
    process.terminate()
    process.wait()
    print("[INFO] Sync Gateway stopped.")

def is_cluster_healthy(cluster_host):
    try:
        url = f"http://{cluster_host}/pools"
        print(f"[INFO] Checking Couchbase health at {url}")
        response = requests.get(
            url,
            timeout=5,
            auth=(COUCHBASE_USERNAME, COUCHBASE_PASSWORD)
        )
        if response.status_code == 200:
            print("[INFO] Cluster is healthy.")
            return True
        else:
            print(f"[WARN] Cluster unhealthy, status: {response.status_code}")
    except requests.RequestException as e:
        print(f"[WARN] Health check failed: {e}")
    return False

def main():
    print("[INFO] Starting orchestrator script...")

    current_cluster = CLUSTERS[0]  # use first cluster as initial
    generate_config(current_cluster)
    sync_process = start_sync_gateway()

    print("[INFO] Waiting for clusters to initialize...")
    time.sleep(180)  # wait 3 minutes before health checks

    while True:
        if is_cluster_healthy(current_cluster):
            time.sleep(30)
            continue  # current cluster is healthy

        print(f"[WARN] Cluster {current_cluster} is unavailable. Trying other clusters...")

        found_healthy = False
        for cluster in CLUSTERS:
            if cluster == current_cluster:
                continue  # already failed, skip it

            if is_cluster_healthy(cluster):
                print(f"[INFO] Found healthy cluster: {cluster}. Switching Sync Gateway.")
                stop_sync_gateway(sync_process)
                generate_config(cluster)
                sync_process = start_sync_gateway()
                current_cluster = cluster
                found_healthy = True
                break

        if not found_healthy:
            print("[ERROR] No clusters are currently healthy! Retrying in 30s.")
            time.sleep(30)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n[INFO] Orchestrator stopped by user.")
        sys.exit(0)
