#!/bin/sh
# Wait for the database to be ready (optional, but good practice in docker-compose)
sleep 3

export HOME=/tmp
export npm_config_cache=/tmp/.npm

echo "Waiting for database to be ready..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Attempting to push DB Schema (Attempt $((RETRY_COUNT+1))/$MAX_RETRIES)..."
  if npx -y prisma@5.22.0 db push --accept-data-loss --skip-generate; then
    echo "DB Schema pushed successfully."
    break
  fi
  echo "DB push failed. Retrying in 3 seconds..."
  sleep 3
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "Failed to push DB schema after $MAX_RETRIES attempts. Exiting."
  exit 1
fi

echo "Seeding Database..."
npx -y tsx@4.23.9 prisma/seed_cohorts.ts
npx -y tsx@4.23.9 prisma/seed.ts

echo "Starting Next.js..."
exec node server.js
