# app.py
from flask import Flask, request, jsonify
from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions, QueryOptions
from couchbase.exceptions import CouchbaseException
from datetime import timedelta
import os, time
from math import radians, sin, cos, sqrt, asin

app = Flask(__name__)

# Environment config (good practice in Docker)
COUCHBASE_HOST = os.getenv("COUCHBASE_HOST", "localhost")
COUCHBASE_USER = os.getenv("COUCHBASE_USERNAME", "beacon")
COUCHBASE_PASS = os.getenv("COUCHBASE_PASSWORD", "beacon")

# Initialize Couchbase cluster connection with retries
for attempt in range(1, 7):
    try:
        auth = PasswordAuthenticator(COUCHBASE_USER, COUCHBASE_PASS)
        cluster = Cluster.connect(
            f'couchbase://{COUCHBASE_HOST}', ClusterOptions(auth)
        )
        cluster.wait_until_ready(timedelta(seconds=5))
        bucket = cluster.bucket("beacon")
        coll = bucket.default_collection()
        print("✅ Couchbase connection established")
        break
    except CouchbaseException as e:
        print(f"⚠️ Attempt {attempt} failed: {e}")
        time.sleep(5)
else:
    raise RuntimeError("❌ Unable to connect to Couchbase bucket 'beacon' after retries")


@app.route('/responders', methods=['GET'])
def get_responders():
    try:
        user_lat = float(request.args['lat'])
        user_lon = float(request.args['lon'])
        radius = float(request.args.get('radius', 50))  # default to 50 km
    except (KeyError, ValueError):
        return jsonify({"error": "Missing or invalid 'lat','lon', or 'radius' params"}), 400

    query = "SELECT userId, name, responderType, location, status FROM `beacon` WHERE type='user' AND userType='responder';"
    try:
        rows = cluster.query(query, QueryOptions(metrics=False))
        responders = [dict(r) for r in rows]
    except CouchbaseException as e:
        return jsonify({"error": "Query failed", "details": str(e)}), 500

    total = len(responders)
    print(f"Total responders found: {total}", flush=True)
    filtered = []
    for doc in responders:
        lat2 = doc['location']['lat']
        lon2 = doc['location']['lon']
        dist_km = haversine(user_lat, user_lon, lat2, lon2)
        print(f"⚠️ Distance in km {dist_km}")
        if dist_km <= radius:
            doc['dist_km'] = round(dist_km, 3)
            filtered.append(doc)

    filtered.sort(key=lambda x: x['dist_km'])

    print(f"Total filtered responders : {len(filtered)} within radius: {radius} km", flush=True)

    return jsonify(filtered[:100])


@app.route('/emergency', methods=['POST'])
def create_emergency():
    doc = request.json
    required = ["type", "request_by", "requested_at"]
    if not all(k in doc for k in required):
        return jsonify({"error": f"Missing fields: {required}"}), 400

    doc["type"] = "emergency_request"
    doc_id = f"emr::{doc['request_by']}::{doc['requested_at']}"
    try:
        res = coll.upsert(doc_id, doc)
        return jsonify({"id": doc_id, "cas": str(res.cas)})
    except CouchbaseException as e:
        return jsonify({"error": "Upsert failed", "details": str(e)}), 500



def haversine(lat1, lon1, lat2, lon2):
    # Earth radius in kilometers
    R = 6371.0  
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    lat1 = radians(lat1)
    lat2 = radians(lat2)

    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c * 1000  # return distance in meters


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
