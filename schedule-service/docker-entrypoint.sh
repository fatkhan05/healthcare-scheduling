#!/bin/sh
set -e

echo "Running Prisma db push for schedule-service..."
npx prisma db push --skip-generate

echo "Starting Schedule Service..."
exec "$@"
