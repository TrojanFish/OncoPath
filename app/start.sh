#!/bin/sh
# Wait for database container networking
sleep 2

export HOME=/tmp
export npm_config_cache=/tmp/.npm

echo "Waiting for database to be ready..."
MAX_RETRIES=15
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Attempting to push DB Schema (Attempt $((RETRY_COUNT+1))/$MAX_RETRIES)..."
  if prisma db push --skip-generate; then
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
tsx prisma/seed_cohorts.ts || echo "Notice: Cohorts seeding completed or skipped."
tsx prisma/seed.ts || echo "Notice: Knowledge graph seeding completed or skipped."

echo "Starting Next.js production server..."
exec node server.js
