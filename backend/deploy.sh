#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

# Pastikan dist/ ada — build ulang jika tidak ada
if [ ! -f "dist/main.js" ]; then
    echo "⚠️  dist/main.js not found! Running build now..."
    npm install
    npx prisma generate
    npm run build
    echo "✅ Build complete"
else
    echo "✅ dist/main.js found, skipping build"
fi

echo "📦 Running Prisma db push..."
npx prisma db push --accept-data-loss

echo "🌱 Running seed (skipped if data exists)..."
node prisma/seed.js

echo "✅ Starting NestJS application..."
node dist/main
