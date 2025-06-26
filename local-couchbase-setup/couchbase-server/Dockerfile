FROM couchbase:enterprise-7.6.6 AS stage_base
COPY init-cbserver.sh /opt/couchbase/init/
COPY users.json /opt/couchbase/init/
COPY user_credentials.json /opt/couchbase/init/
## Force error if files are missing:
RUN test -f /opt/couchbase/init/init-cbserver.sh
RUN test -f /opt/couchbase/init/users.json
RUN test -f /opt/couchbase/init/user_credentials.json

