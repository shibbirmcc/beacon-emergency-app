# 🚀 Project Setup Guide

This guide will help you set up the project environment using Docker.

---

## 📦 Prerequisites
- **Docker Desktop** installed  
  [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- Docker Desktop should be running.

---

## 🛠️ Setup Instructions

### 1. Install Docker Desktop
If you don’t have Docker Desktop:
- Download and install it from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

---

### 2. Run Docker Desktop
Make sure Docker Desktop is running before proceeding.

---

### 3. Set Up the Cluster
Open a terminal in the project root directory and run:

```bash
docker-compose -f ./docker-compose.yml up -d
```

On Windows, you can also use:

```bash
docker-compose -f .\docker-compose.yml up -d
```
---

### 4. Seed the Data
After the cluster is up, run:
```bash
docker-compose -f ./docker-compose.seeder.yml up -d
```
On Windows, you can also use:
```bash
docker-compose -f .\docker-compose.seeder.yml up -d
```
This will populate the database with initial seed data.
