package com.beacon;

import com.couchbase.lite.Conflict;
import com.couchbase.lite.ConflictResolver;
import com.couchbase.lite.Document;
import com.couchbase.lite.MutableDocument;

import java.util.Collections;
import java.util.Map;

public class P2PConflictResolver implements ConflictResolver {
    @Override
    public Document resolve(Conflict conflict) {
        Document localDoc = conflict.getLocalDocument();
        Document remoteDoc = conflict.getRemoteDocument();

        Map<String, Object> localMap = (localDoc != null) ? localDoc.toMap() : Collections.emptyMap();
        Map<String, Object> remoteMap = (remoteDoc != null) ? remoteDoc.toMap() : Collections.emptyMap();

        long localTimestamp = getRelevantTimestamp(localMap);
        long remoteTimestamp = getRelevantTimestamp(remoteMap);

        if (localTimestamp <= remoteTimestamp) {
            return new MutableDocument(conflict.getDocumentId(), localMap);
        } else {
            return new MutableDocument(conflict.getDocumentId(), remoteMap);
        }
    }

    private long getRelevantTimestamp(Map<String, Object> map) {
        Object respondedAtObj = map.get("responded_at");
        if (respondedAtObj instanceof Number) {
            return ((Number) respondedAtObj).longValue();
        }

        Object requestedAtObj = map.get("requested_at");
        if (requestedAtObj instanceof Number) {
            return ((Number) requestedAtObj).longValue();
        }

        // If neither field is present or invalid, treat it as Long.MAX_VALUE so it loses
        return Long.MAX_VALUE;
    }
}