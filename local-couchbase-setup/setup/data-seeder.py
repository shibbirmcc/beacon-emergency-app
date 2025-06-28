import json
import sys
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.exceptions import CouchbaseException

# Map type to document ID key
DOC_ID_KEYS = {
    "user": "userId",
    "emergency_request": None,  # no single ID in your sample, we'll generate one
}

def seed_data(json_file_path, bucket_name, cluster_conn_str, username, password):
    try:
        cluster = Cluster(cluster_conn_str, ClusterOptions(
            PasswordAuthenticator(username, password)
        ))
        bucket = cluster.bucket(bucket_name)
        collection = bucket.default_collection()
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            docs = json.load(f)

        print(f"Seeding {len(docs)} documents from {json_file_path} into bucket '{bucket_name}'...")

        for idx, doc in enumerate(docs):
            doc_type = doc.get("type")
            if not doc_type:
                print(f"Skipping document with no type: {doc}")
                continue

            doc_id_key = DOC_ID_KEYS.get(doc_type)

            if doc_type == "user":
                doc_id = doc.get(doc_id_key)
                if not doc_id:
                    print(f"Skipping user document with no userId: {doc}")
                    continue
            elif doc_type == "emergency_request":
                # For emergency_request, create an ID combining type + idx (or timestamp if preferred)
                doc_id = f"{doc_type}::{idx+1}"
            else:
                # Fallback: use type + idx as ID
                doc_id = f"{doc_type}::{idx+1}"

            collection.upsert(doc_id, doc)
            print(f"Inserted/Updated document ID: {doc_id}")

        print("Seeding completed successfully.")

    except CouchbaseException as e:
        print(f"Error seeding data: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Usage: python seed_couchbase.py <bucket> <conn_str> <username> <password> <json_file1> [json_file2 ...]
    if len(sys.argv) < 6:
        print("Usage: python seed_couchbase.py <bucket> <conn_str> <username> <password> <json_file1> [json_file2 ...]")
        sys.exit(1)

    bucket = sys.argv[1]
    conn_str = sys.argv[2]
    user = sys.argv[3]
    pwd = sys.argv[4]
    json_files = sys.argv[5:]
    
    print("Seeding db ...")
    for jf in json_files:
        seed_data(jf, bucket, conn_str, user, pwd)
    print("Seeding db is done!")
