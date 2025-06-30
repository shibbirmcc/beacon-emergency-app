#!/bin/bash

PRIMARY_CLUSTER="http://couchbase-server:8091"
SECONDARY_CLUSTER="http://couchbase-server-2:8091"
CONFIG_FILE="/etc/sync_gateway/config.json"
SYNC_PROCESS_NAME="sync_gateway"

check_cluster() {
    CLUSTER_URL=$1
    echo "Checking cluster at $CLUSTER_URL"
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 5 -u Administrator:admin00 "$CLUSTER_URL/pools")
    # Extract HTTP code from the last line
    HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_CODE | cut -d':' -f2)
    if [ "$HTTP_STATUS" == "200" ]; then
        echo "Cluster at $CLUSTER_URL is healthy."
        return 0
    else
        echo "Cluster at $CLUSTER_URL is unavailable."
        return 1
    fi
}

update_config() {
    CLUSTER_URL=$1
    # Extract hostname from URL for couchbase:// URI
    HOST=$(echo "$CLUSTER_URL" | sed -E 's#https?://([^:/]+).*#\1#')
    echo "Updating Sync Gateway config to use couchbase://$HOST"
    jq --arg server "couchbase://$HOST" '.databases.beacon.server = $server' "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
}

restart_sync_gateway() {
    echo "Restarting Sync Gateway..."
    pkill -f $SYNC_PROCESS_NAME
    /opt/couchbase-sync-gateway/bin/sync_gateway $CONFIG_FILE &
}

while true; do
    echo "Starting health check..."
    if check_cluster "$PRIMARY_CLUSTER"; then
        update_config "$PRIMARY_CLUSTER"
        restart_sync_gateway
    elif check_cluster "$SECONDARY_CLUSTER"; then
        update_config "$SECONDARY_CLUSTER"
        restart_sync_gateway
    else
        echo "Both clusters are down. Retrying in 30 seconds."
    fi
    sleep 30
done
