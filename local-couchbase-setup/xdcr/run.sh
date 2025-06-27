#!/bin/bash
set -e

docker run --rm -it \
  --network local-couchbase-setup_workshop \
  -e CLUSTER1_URL=http://couchbase-server:8091 \
  -e CLUSTER2_URL=http://couchbase-server-2:8091 \
  -e COUCHBASE_ADMINISTRATOR_USERNAME=Administrator \
  -e COUCHBASE_ADMINISTRATOR_PASSWORD=admin00 \
  -e COUCHBASE_BUCKET=beacon \
  -v ./setup-xdcr.sh:/usr/local/bin/setup-xdcr.sh \
  --entrypoint /usr/local/bin/setup-xdcr.sh \
  xdcr-setup:latest
