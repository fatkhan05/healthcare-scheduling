#!/bin/sh
set -e

echo "Running Prisma migrations for auth-service..."
npx prisma migrate deploy || npx prisma db push

echo "Starting Auth Service..."
exec "$@"
