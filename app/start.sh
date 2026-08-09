#!/bin/sh
# Wait for the database to be ready (optional, but good practice in docker-compose)
sleep 3

export HOME=/tmp
export npm_config_cache=/tmp/.npm

echo "Pushing DB Schema..."
npx -y prisma db push --accept-data-loss

echo "Seeding Database..."
npx -y tsx prisma/seed_cohorts.ts

echo "Starting Next.js..."
exec node server.js
