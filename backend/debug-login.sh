#!/bin/bash

echo "🔍 Debugging Login Issue"
echo "========================"
echo ""

# 1. Check if backend is running
echo "1. Checking backend server..."
if curl -s http://localhost:3000/api > /dev/null 2>&1; then
    echo "✓ Backend is running on port 3000"
    curl -s http://localhost:3000/api | jq .
else
    echo "✗ Backend is NOT running!"
    echo "Please start backend: cd backend && npm run start:dev"
    exit 1
fi

echo ""

# 2. Test login endpoint directly
echo "2. Testing login endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@cimahipos.com","password":"cashier123"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Login endpoint works!"
    TOKEN=$(echo "$BODY" | jq -r '.data.access_token')
    echo "Token (first 50 chars): ${TOKEN:0:50}..."
else
    echo "✗ Login failed!"
fi

echo ""

# 3. Check frontend .env
echo "3. Checking frontend configuration..."
if [ -f "../frontend/.env.local" ]; then
    echo "Frontend .env.local:"
    cat ../frontend/.env.local
else
    echo "✗ .env.local not found!"
fi

echo ""

# 4. Test from frontend perspective
echo "4. Testing CORS..."
curl -s -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -i "access-control"

echo ""
echo "========================"
echo "Debug complete!"
