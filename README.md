# Beacon: The Emergency App

**Beacon** is an emergency response app designed to help users quickly locate and request help from nearby responders — even when network connectivity is unreliable.

Built with **Couchbase Lite** for offline-first data storage and **Couchbase Sync Gateway** for real-time sync, **Beacon** ensures that emergency coordination can continue in the most challenging conditions — such as terror attacks, warfare, natural disasters, or large-scale network outages.

## Key Features

- 🌍 **Map-Based Interface:** Displays the user's current location and nearby responders.
- 🚑 **Responder Types:** Ambulance, Doctor, Fire Truck, Rescue Team, Generator, Water Supply, and more.
- 🔴🟢 **Availability Indicators:** Visual status — Green = Available, Red = Occupied.
- ➕ **Emergency Request:** Simple request flow — user selects type of emergency help needed and submits.
- 📡 **Offline Resilience:** Works seamlessly offline using Couchbase Lite — syncs automatically when the network is restored.
- ⚡ **Real-Time Updates:** Live responder location and status updates when help is dispatched.
- 🔁 **Cross-Data Center Replication:** Built to work in distributed environments with Couchbase Sync Gateway and Couchbase Server.
- 🛡️ **Disaster-Ready:** Can function even when a data center or network segment is under attack.

## Technology Stack

- Android Native (Jetpack Compose) / Flutter (planned)
- Couchbase Lite
- Couchbase Sync Gateway
- Couchbase Server (Capella / self-hosted)

## Prototype Goals

This app is built as a part of a Couchbase hackathon challenge:

- Build an enterprise system resilient to disasters: terror attacks, warfare, network outages, data center failures, denial of service attacks.
- Ensure mobile/edge app continues to function during network outage.
- Support cross-data center replication for disaster recovery.
- Scale quickly and cost-efficiently during denial of service attacks.

## Current Status

✅ First version — Minimal Viable App (MVP) with:

- Map-based interface  
- Emergency request functionality  
- Offline-first operation  
- Sync Gateway integration  

Planned:

- Separate User & Responder apps  
- Real-time responder dispatch  
- UI improvements  
- Multi-data center testing

## Setup Couchbase Server and Sync Gateway locally
Execute below commands to run couchbase server and sync gateway locally. There will be 100 responders and 5 requester data inserted at the startup for demo purpose.
#### N.B: Better to run the docker setup in linux environment ( Mac has some issues running Indexer service inside couchbase server)
```sh
cd local-couchbase-setup
docker-compose build
docker compose up -d
```

## Setup Bidirectional Replication using XDCR configuration
Once couchbase-server and couchbase-server-1 is started and all the internal configurations are Complete, the run this 
```sh
cd local-couchbase-setup/xdcr
docker build -t xdcr-setup:latest .
./run
```

## Document structure
### User
```json
{
  "type": "user",
  "userId": "8beb7b9d-6403-4e4b-ad16-1a25bb294d45",
  "name": "Uriah Walters",
  "userType": "responder",    // or "requester"
  "responderType": "Ambulance",  // (only for responders) e.g. "Ambulance", "Doctor", "Fire Truck", "Rescue Team", etc.
  "location": {
    "lat": 59.30239,
    "lon": 18.12934
  },
  "status": "available",       // "available", "occupied", "unavailable"
  "lastUpdated": "2025-06-25T09:15:43.362654+00:00"
}
```
### User Credential
```json
{
  "type": "user_credentials",
  "userId": "1b7a1935-9712-4142-90a2-016944824dee",
  "username": "matilda",
  "password": "$2b$12$ZBrFUO4ckEdllP69ftQO2.9zOptZAlaxoDW6flG2siUKUWuFdYFle"  // bcrypt-hashed
}

```

### Emergency Request
```json
{
    "type":"emergency_request",
    "request_by": "36894809-5d24-4f1e-b851-7fa36ec234a8", /// Request's userId
    "requested_at":  "2025-06-25T09:15:43.362654+00:00",
    "status": "responded", // open, responded, completed
    "responded_by": "8beb7b9d-6403-4e4b-ad16-1a25bb294d45",
    "responded_at": "2025-06-25T09:15:43.362654+00:00",
    "notes_by_responder": ""
}
```
---

**License:** MIT  
**Contributors:** Shibbir Ahmed, 

---

