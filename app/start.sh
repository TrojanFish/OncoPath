#!/bin/sh
# Wait for the database to be ready (optional, but good practice in docker-compose)
sleep 3

# Run Prisma schema push to create tables
npx prisma db push

# Run the seed script to populate clinical cohorts
# We use node directly since tsx might not be in the production image, but wait,
# standalone doesn't have prisma CLI either if it's not in dependencies.
# We will use npx since npm is available.
npx tsx prisma/seed_cohorts.ts

# Start Next.js standalone server
exec node server.js
