FROM couchbase/sync-gateway:enterprise AS stage_base
COPY sync-gateway.json /etc/sync_gateway/config.json
COPY --chmod=0755 init-syncgateway.sh /opt/couchbase-sync-gateway/init/init-syncgateway.sh
