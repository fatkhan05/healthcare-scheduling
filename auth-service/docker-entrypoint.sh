#!/bin/sh
set -e

echo "Running Prisma db push for auth-service..."
npx prisma db push --skip-generate

echo "Starting Auth Service..."
exec "$@"
