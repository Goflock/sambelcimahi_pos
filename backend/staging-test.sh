#!/bin/bash

# Staging Validation Script - Cimahi POS
# Automated testing untuk semua endpoints

echo "🚀 Starting Cimahi POS Staging Validation..."
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    
    echo -n "Testing: $name ... "
    
    if [ -z "$token" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data")
    fi
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo "📋 Test 1: Health Check"
echo "------------------------"
response=$(curl -s "$BASE_URL")
if echo "$response" | grep -q "Cimahi POS API"; then
    echo -e "${GREEN}✓ Health check PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Health check FAILED${NC}"
    ((FAILED++))
fi
echo ""

echo "🔐 Test 2: Authentication"
echo "------------------------"

# Login as Kasir
echo -n "Login as Kasir ... "
kasir_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"kasir@cimahipos.com","password":"cashier123"}')

if echo "$kasir_response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    KASIR_TOKEN=$(echo $kasir_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Login as Admin
echo -n "Login as Admin ... "
admin_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@cimahipos.com","password":"admin123"}')

if echo "$admin_response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ADMIN_TOKEN=$(echo $admin_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Login as Owner
echo -n "Login as Owner ... "
owner_response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"owner@cimahipos.com","password":"owner123"}')

if echo "$owner_response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    OWNER_TOKEN=$(echo $owner_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi
echo ""

echo "📦 Test 3: Products Endpoints"
echo "------------------------"
test_endpoint "Get all products" "GET" "/products" "" "$KASIR_TOKEN"
test_endpoint "Get available products" "GET" "/products/available" "" "$KASIR_TOKEN"
echo ""

echo "📂 Test 4: Categories Endpoints"
echo "------------------------"
test_endpoint "Get all categories" "GET" "/categories" "" "$KASIR_TOKEN"
echo ""

echo "👥 Test 5: Users Endpoints (RBAC)"
echo "------------------------"
echo -n "Get users with OWNER token ... "
response=$(curl -s -X GET "$BASE_URL/users" \
    -H "Authorization: Bearer $OWNER_TOKEN")
if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo -n "Get users with ADMIN token ... "
response=$(curl -s -X GET "$BASE_URL/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
if echo "$response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo -n "Get users with CASHIER token (should fail) ... "
response=$(curl -s -X GET "$BASE_URL/users" \
    -H "Authorization: Bearer $KASIR_TOKEN")
if echo "$response" | grep -q '"statusCode":403'; then
    echo -e "${GREEN}✓ PASSED (correctly denied)${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED (should be denied)${NC}"
    ((FAILED++))
fi
echo ""

echo "🗄️  Test 6: Database Validation"
echo "------------------------"
echo -n "Checking database records ... "
user_count=$(psql -U postgres -d cimahi_pos -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
product_count=$(psql -U postgres -d cimahi_pos -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)
category_count=$(psql -U postgres -d cimahi_pos -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null | xargs)

if [ "$user_count" = "3" ] && [ "$product_count" = "8" ] && [ "$category_count" = "3" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "  - Users: $user_count"
    echo "  - Products: $product_count"
    echo "  - Categories: $category_count"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "  - Users: $user_count (expected 3)"
    echo "  - Products: $product_count (expected 8)"
    echo "  - Categories: $category_count (expected 3)"
    ((FAILED++))
fi
echo ""

echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests PASSED! System is ready for staging.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
