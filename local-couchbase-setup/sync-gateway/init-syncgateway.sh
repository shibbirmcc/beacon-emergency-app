#!/bin/bash

FILE=/tmp/setupComplete.txt

if ! [ -f "$FILE" ]; then
  sleep 30s
  touch $FILE
else
  sleep 10s
fi


set -euxo pipefail 

CONFIG_FILE=/etc/sync_gateway/config.json

# echo "CONFIG_FILE=$CONFIG_FILE"
# echo "COUCHBASE_HOST=$COUCHBASE_HOST"

# echo "Updating Sync Gateway config to use couchbase://$COUCHBASE_HOST"
# jq --arg server "couchbase://$COUCHBASE_HOST" '.databases.beacon.server = $server' "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" 
# mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"

# Start health check in background
# /opt/couchbase-sync-gateway/init/healthcheck.sh &


# NO '&' — run as main process
exec /entrypoint.sh $CONFIG_FILE




## The entrypoint.sh contents
# #!/bin/bash
# set -e
# LOGFILE_DIR=${LOGFILE_DIR:-/var/log/sync_gateway}
# exec sync_gateway --defaultLogFilePath="${LOGFILE_DIR}" "$@"

