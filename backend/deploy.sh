#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

echo "📦 Running Prisma db push..."
npx prisma db push --accept-data-loss

echo "🌱 Running seed (skipped if data exists)..."
node prisma/seed.js

echo "✅ Starting NestJS application..."
node dist/main
