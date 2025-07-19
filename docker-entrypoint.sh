#!/bin/sh

echo "⏳ Waiting for PostgreSQL..."

until nc -z db 5432; do
  echo "⌛ Waiting for db:5432..."
  sleep 2
done

echo "✅ PostgreSQL is up. Running migration..."
npm run prisma:dev

echo "🚀 Starting NestJS..."
npm run start:dev
