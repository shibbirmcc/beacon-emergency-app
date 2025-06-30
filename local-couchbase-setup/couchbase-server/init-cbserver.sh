#!/bin/bash

# Start Couchbase Server in background
/entrypoint.sh couchbase-server &

# Setup complete marker
FILE=/opt/couchbase/init/setupComplete.txt

if ! [ -f "$FILE" ]; then

  echo "⚙️  Starting Couchbase cluster-init..."
  sleep 10s

  /opt/couchbase/bin/couchbase-cli cluster-init -c 127.0.0.1 \
    --cluster-username $COUCHBASE_ADMINISTRATOR_USERNAME \
    --cluster-password $COUCHBASE_ADMINISTRATOR_PASSWORD \
    --services data,index,query,eventing \
    --cluster-ramsize $COUCHBASE_RAM_SIZE \
    --cluster-index-ramsize $COUCHBASE_INDEX_RAM_SIZE \
    --cluster-eventing-ramsize $COUCHBASE_EVENTING_RAM_SIZE \
    --index-storage-setting default

  sleep 5s

  echo "⚙️  Creating bucket $COUCHBASE_BUCKET ..."
  /opt/couchbase/bin/couchbase-cli bucket-create -c localhost:8091 \
    --username $COUCHBASE_ADMINISTRATOR_USERNAME \
    --password $COUCHBASE_ADMINISTRATOR_PASSWORD \
    --bucket $COUCHBASE_BUCKET \
    --bucket-ramsize $COUCHBASE_BUCKET_RAMSIZE \
    --bucket-type couchbase

  echo "⏳ Waiting for bucket $COUCHBASE_BUCKET to become healthy..."
  until /opt/couchbase/bin/curl -s -u $COUCHBASE_ADMINISTRATOR_USERNAME:$COUCHBASE_ADMINISTRATOR_PASSWORD \
    http://localhost:8091/pools/default/buckets/$COUCHBASE_BUCKET | grep -q '"status":"healthy"'; do
    echo "Waiting for bucket to become healthy..."
    sleep 5
  done
  echo "✅ Bucket $COUCHBASE_BUCKET is healthy!"

  echo "⚙️  Creating Sync Gateway user..."
  /opt/couchbase/bin/couchbase-cli user-manage \
    --cluster http://127.0.0.1 \
    --username $COUCHBASE_ADMINISTRATOR_USERNAME \
    --password $COUCHBASE_ADMINISTRATOR_PASSWORD \
    --set \
    --rbac-username $COUCHBASE_RBAC_USERNAME \
    --rbac-password $COUCHBASE_RBAC_PASSWORD \
    --roles mobile_sync_gateway[*] \
    --auth-domain local

  echo "⚙️  Creating Backend user..."
  /opt/couchbase/bin/couchbase-cli user-manage \
    --cluster http://127.0.0.1 \
    --username $COUCHBASE_ADMINISTRATOR_USERNAME \
    --password $COUCHBASE_ADMINISTRATOR_PASSWORD \
    --set \
    --rbac-username $COUCHBASE_RBAC_BACKEND_USERNAME \
    --rbac-password $COUCHBASE_RBAC_BACKEND_PASSWORD \
    --roles query_select[beacon],data_reader[beacon],data_writer[beacon] \
    --auth-domain local




  echo "⏳ Waiting for existing indexes to be online..."
  until /opt/couchbase/bin/cbq \
    -u $COUCHBASE_ADMINISTRATOR_USERNAME \
    -p $COUCHBASE_ADMINISTRATOR_PASSWORD \
    -s "SELECT COUNT(*) as count FROM system:indexes WHERE keyspace_id = '$COUCHBASE_BUCKET' AND state != 'online';" \
    | grep -q '"count": 0'; do
    echo "Waiting for indexes to be online..."
    sleep 5
  done
  echo "✅ All indexes online — ready to create new indexes."

  echo "⚙️  Creating indexes..."

  /opt/couchbase/bin/cbq -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD -s \
  "CREATE INDEX idx_beacon_location ON \`$COUCHBASE_BUCKET\`(location) WHERE type = 'user';"

  /opt/couchbase/bin/cbq -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD -s \
  "CREATE INDEX idx_beacon_userType ON \`$COUCHBASE_BUCKET\`(userType) WHERE type = 'user';"

  /opt/couchbase/bin/cbq -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD -s \
  "CREATE INDEX idx_beacon_responderType ON \`$COUCHBASE_BUCKET\`(responderType) WHERE type = 'user';"

  /opt/couchbase/bin/cbq -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD -s \
  "CREATE INDEX idx_beacon_status ON \`$COUCHBASE_BUCKET\`(status) WHERE type = 'user';"

  /opt/couchbase/bin/cbq -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD -s \
  "CREATE INDEX idx_beacon_username ON \`$COUCHBASE_BUCKET\`(username) WHERE type = 'user_credentials';"

  echo "Creating primary and geo composite indexes..."
  /opt/couchbase/bin/cbq -u "$COUCHBASE_ADMINISTRATOR_USERNAME" -p "$COUCHBASE_ADMINISTRATOR_PASSWORD" << EOF
  CREATE PRIMARY INDEX IF NOT EXISTS ON \`$COUCHBASE_BUCKET\`;
  CREATE INDEX IF NOT EXISTS idx_beacon_lat_lon
    ON \`$COUCHBASE_BUCKET\`(\`location\`.\`lat\`, \`location\`.\`lon\`)
    WHERE type = "user" AND userType = "responder";
EOF



  if [[ "$CLUSTER_ID" == "1" ]]; then
      echo "⚙️  Importing sample users and credentials..."
      /opt/couchbase/bin/cbimport json --format list \
        -c http://localhost:8091 \
        -u $COUCHBASE_ADMINISTRATOR_USERNAME \
        -p $COUCHBASE_ADMINISTRATOR_PASSWORD \
        -d "file:///opt/couchbase/init/users.json" -b $COUCHBASE_BUCKET -g "user::%userId%"


      # /opt/couchbase/bin/cbimport json --format list \
      #   -c http://localhost:8091 \
      #   -u $COUCHBASE_ADMINISTRATOR_USERNAME \
      #   -p $COUCHBASE_ADMINISTRATOR_PASSWORD \
      #   -d "file:///opt/couchbase/init/user_credentials.json" -b $COUCHBASE_BUCKET -g "user_credentials::%userId%"

      echo "✅ Sample users and credentials import successfull";
  fi



  echo "✅ All setup complete."

  # Mark done
  touch $FILE
fi

# Keep container running
tail -f /dev/null
