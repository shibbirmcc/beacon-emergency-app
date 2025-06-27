package com.beacon;

import com.couchbase.lite.Conflict;
import com.couchbase.lite.ConflictResolver;
import com.couchbase.lite.Document;
import com.couchbase.lite.MutableDocument;

import java.util.Map;

public class P2PConflictResolver implements ConflictResolver{

    // TODO: Only conflic will occur if multiple responders responds to the same request. take care of it once sync and request creation is successful
    public Document resolve(Conflict conflict) {
        Map<String, Object> merge = conflict.getLocalDocument().toMap();
        merge.putAll(conflict.getRemoteDocument().toMap());
        return new MutableDocument(conflict.getDocumentId(), merge);
    }
}
