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


---

**License:** MIT  
**Contributors:** Shibbir Ahmed, 

---

