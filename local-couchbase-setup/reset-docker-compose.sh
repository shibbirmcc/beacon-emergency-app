#!/usr/bin/env bash
set -e

echo "🛑 Stopping and removing all containers from docker-compose..."
docker-compose down

echo "🧹 Removing all images for this project..."
docker-compose images -q | xargs -r docker rmi

echo "🧱 Pruning unused images, containers, volumes..."
docker system prune -af --volumes

echo "🔧 Rebuilding services with no cache..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

echo "✅ All done!"
