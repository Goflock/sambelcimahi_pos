#!/bin/bash

# Test Login Script - Cimahi POS
# Test login untuk semua 3 roles

echo "🔐 Testing Login for All Roles"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000/api"

# Function to test login
test_login() {
    local role=$1
    local email=$2
    local password=$3
    
    echo -e "${BLUE}Testing: $role${NC}"
    echo "Email: $email"
    
    response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    # Check if login successful
    if echo "$response" | grep -q "access_token"; then
        echo -e "${GREEN}✓ Login SUCCESS${NC}"
        
        # Extract and display token (first 50 chars)
        token=$(echo $response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        echo "Token: ${token:0:50}..."
        
        # Extract user info
        name=$(echo $response | grep -o '"name":"[^"]*' | cut -d'"' -f4)
        role_name=$(echo $response | grep -o '"role":"[^"]*' | cut -d'"' -f4)
        
        echo "Name: $name"
        echo "Role: $role_name"
        
        # Save token to file for later use
        echo "$token" > "token_${role_name}.txt"
        echo -e "${GREEN}Token saved to: token_${role_name}.txt${NC}"
    else
        echo -e "${RED}✗ Login FAILED${NC}"
        echo "Response: $response"
    fi
    
    echo ""
}

# Test all 3 roles
test_login "CASHIER" "kasir@cimahipos.com" "cashier123"
test_login "ADMIN" "admin@cimahipos.com" "admin123"
test_login "OWNER" "owner@cimahipos.com" "owner123"

echo "=============================="
echo "✅ Login tests completed!"
echo ""
echo "💡 Tip: Use saved tokens for testing protected endpoints:"
echo "   curl http://localhost:3000/api/products \\"
echo "     -H \"Authorization: Bearer \$(cat token_CASHIER.txt)\""
