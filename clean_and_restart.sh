#!/bin/bash
echo "🛑 Killing all Node.js processes..."
pkill -f node
pkill -f nest
pkill -f next

echo "🧹 Cleaning Frontend Cache..."
cd frontend
rm -rf .next
cd ..

echo "🧹 Cleaning Backend Build..."
cd backend
rm -rf dist
cd ..

echo "✅ Cleanup Complete!"
echo "👉 Now please run the following in separate terminals:"
echo "1. Backend: cd backend && npm run start:dev"
echo "2. Frontend: cd frontend && npm run dev"
