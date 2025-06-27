#!/bin/bash
set -e

# Wait for Cluster 1
while true; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -u "$COUCHBASE_ADMINISTRATOR_USERNAME:$COUCHBASE_ADMINISTRATOR_PASSWORD" "$CLUSTER1_URL/pools/default" || echo "000")
  echo "Cluster 1 HTTP status: $status"
  if [[ "$status" == "200" ]]; then
    echo "✅ Cluster 1 is ready!"
    break
  else
    echo "⏳ Waiting for Cluster 1 at $CLUSTER1_URL..."
    sleep 5
  fi
done

# Wait for Cluster 2
while true; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -u "$COUCHBASE_ADMINISTRATOR_USERNAME:$COUCHBASE_ADMINISTRATOR_PASSWORD" "$CLUSTER2_URL/pools/default" || echo "000")
  echo "Cluster 1 HTTP status: $status"
  if [[ "$status" == "200" ]]; then
    echo "✅ Cluster 1 is ready!"
    break
  else
    echo "⏳ Waiting for Cluster 1 at $CLUSTER2_URL..."
    sleep 5
  fi
done

echo "✅ Both clusters are up, configuring XDCR..."

# Setup replication: Cluster 1 -> Cluster 2
couchbase-cli xdcr-setup \
  --cluster "$CLUSTER1_URL" \
  --username "$COUCHBASE_ADMINISTRATOR_USERNAME" \
  --password "$COUCHBASE_ADMINISTRATOR_PASSWORD" \
  --create \
  --xdcr-cluster-name cluster2 \
  --xdcr-hostname $(echo $CLUSTER2_URL | sed 's~http://~~') \
  --xdcr-username "$COUCHBASE_ADMINISTRATOR_USERNAME" \
  --xdcr-password "$COUCHBASE_ADMINISTRATOR_PASSWORD"

couchbase-cli xdcr-replicate \
  --cluster "$CLUSTER1_URL" \
  --username "$COUCHBASE_ADMINISTRATOR_USERNAME" \
  --password "$COUCHBASE_ADMINISTRATOR_PASSWORD" \
  --create \
  --xdcr-cluster-name cluster2 \
  --xdcr-from-bucket "$COUCHBASE_BUCKET" \
  --xdcr-to-bucket "$COUCHBASE_BUCKET"

# Setup replication: Cluster 2 -> Cluster 1
couchbase-cli xdcr-setup \
  --cluster "$CLUSTER2_URL" \
  --username "$COUCHBASE_ADMINISTRATOR_USERNAME" \
  --password "$COUCHBASE_ADMINISTRATOR_PASSWORD" \
  --create \
  --xdcr-cluster-name cluster1 \
  --xdcr-hostname $(echo $CLUSTER1_URL | sed 's~http://~~') \
  --xdcr-username "$COUCHBASE_ADMINISTRATOR_USERNAME" \
  --xdcr-password "$COUCHBASE_ADMINISTRATOR_PASSWORD"

couchbase-cli xdcr-replicate \
  --cluster "$CLUSTER2_URL" \
  --username "$COUCHBASE_ADMINISTRATOR_USERNAME" \
  --password "$COUCHBASE_ADMINISTRATOR_PASSWORD" \
  --create \
  --xdcr-cluster-name cluster1 \
  --xdcr-from-bucket "$COUCHBASE_BUCKET" \
  --xdcr-to-bucket "$COUCHBASE_BUCKET"

echo "✅ Bidirectional XDCR configured successfully."
