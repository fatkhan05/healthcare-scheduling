#!/bin/sh
set -e

echo "Running Prisma migrations for schedule-service..."
npx prisma migrate deploy || npx prisma db push

echo "Starting Schedule Service..."
exec "$@"
