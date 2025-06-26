#!/bin/bash

FILE=/tmp/setupComplete.txt

if ! [ -f "$FILE" ]; then
  sleep 30s
  touch $FILE
else
  sleep 10s
fi

# NO '&' — run as main process
exec /entrypoint.sh /etc/sync_gateway/config.json
