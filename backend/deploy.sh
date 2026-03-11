#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."
echo "📁 Working directory: $(pwd)"

# NODE_ENV=production membuat npm skip devDeps (TypeScript, NestJS CLI)
# Paksa install semua deps termasuk devDependencies untuk build
echo "📦 Installing ALL dependencies (including devDeps for build)..."
npm install --include=dev

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "🔨 Building NestJS app..."
npm run build

# Debug: cek apakah dist berhasil dibuat
echo "📋 Checking build output..."
if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js exists!"
else
    echo "❌ dist/main.js MISSING after build! Listing dist/:"
    ls -la dist/ 2>/dev/null || echo "dist/ directory does not exist"
    exit 1
fi

echo "📦 Running Prisma db push..."
npx prisma db push --accept-data-loss

echo "🌱 Running seed (skipped if data exists)..."
node prisma/seed.js

echo "✅ Starting NestJS application..."
node dist/main
