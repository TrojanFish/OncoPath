#!/bin/sh
# Wait for the database to be ready (optional, but good practice in docker-compose)
sleep 3

# Run Prisma schema push to create tables
npx -y prisma db push --accept-data-loss

# Run the seed script to populate clinical cohorts
npx -y tsx prisma/seed_cohorts.ts

# Start Next.js standalone server
exec node server.js
