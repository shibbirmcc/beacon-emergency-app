FROM couchbase/sync-gateway:enterprise AS stage_base
USER root
RUN apt-get update && apt-get install -y curl jq

# Switch back to the original sync_gateway user (UID 1001)
USER sync_gateway

COPY sync-gateway.json /etc/sync_gateway/config.json
COPY --chmod=0755 healthcheck.sh /opt/couchbase-sync-gateway/init/healthcheck.sh
COPY --chmod=0755 init-syncgateway.sh /opt/couchbase-sync-gateway/init/init-syncgateway.sh
