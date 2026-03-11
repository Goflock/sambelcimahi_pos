#!/bin/bash

# Backend API Testing Script
# Comprehensive testing for all endpoints

echo "🧪 Cimahi POS - Backend API Testing"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000/api"

# Check if server is running
echo "📡 Checking server status..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Server is not running!${NC}"
    echo "Please start the server with: npm run start:dev"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Login and get tokens
echo "🔐 Getting authentication tokens..."
./test-login.sh > /dev/null 2>&1
CASHIER_TOKEN=$(cat token_CASHIER.txt)
ADMIN_TOKEN=$(cat token_ADMIN.txt)
OWNER_TOKEN=$(cat token_OWNER.txt)
echo -e "${GREEN}✓ Tokens obtained${NC}"
echo ""

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local token=$4
    local data=$5
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
        ((FAILED++))
    fi
}

# ===========================
# 1. HEALTH CHECK
# ===========================
echo "1️⃣  Health Check"
echo "----------------------------"
test_endpoint "Health check" "GET" "" "" ""
echo ""

# ===========================
# 2. AUTHENTICATION
# ===========================
echo "2️⃣  Authentication"
echo "----------------------------"
test_endpoint "Login as cashier" "POST" "/auth/login" "" '{"email":"kasir@cimahipos.com","password":"cashier123"}'
test_endpoint "Validate token" "GET" "/auth/validate" "$CASHIER_TOKEN" ""
echo ""

# ===========================
# 3. USERS
# ===========================
echo "3️⃣  Users Module"
echo "----------------------------"
test_endpoint "Get all users (Admin)" "GET" "/users" "$ADMIN_TOKEN" ""
test_endpoint "Get user profile" "GET" "/users/me" "$CASHIER_TOKEN" ""
echo ""

# ===========================
# 4. CATEGORIES
# ===========================
echo "4️⃣  Categories Module"
echo "----------------------------"
test_endpoint "Get all categories" "GET" "/categories" "$CASHIER_TOKEN" ""
echo ""

# ===========================
# 5. PRODUCTS
# ===========================
echo "5️⃣  Products Module"
echo "----------------------------"
test_endpoint "Get all products" "GET" "/products" "$CASHIER_TOKEN" ""
test_endpoint "Get available products" "GET" "/products/available" "$CASHIER_TOKEN" ""
echo ""

# ===========================
# 6. STOCKS
# ===========================
echo "6️⃣  Stocks Module"
echo "----------------------------"
test_endpoint "Get all stocks" "GET" "/stocks" "$CASHIER_TOKEN" ""
test_endpoint "Get low stock items" "GET" "/stocks/low" "$ADMIN_TOKEN" ""
test_endpoint "Get stock movements" "GET" "/stocks/movements" "$ADMIN_TOKEN" ""
echo ""

# ===========================
# 7. ORDERS
# ===========================
echo "7️⃣  Orders Module"
echo "----------------------------"
test_endpoint "Get all orders" "GET" "/orders" "$CASHIER_TOKEN" ""

# Get product IDs for order creation
PRODUCT_IDS=$(curl -s "$BASE_URL/products" -H "Authorization: Bearer $CASHIER_TOKEN" | jq -r '.data[0:2] | .[] | .id')
PRODUCT_ID_1=$(echo "$PRODUCT_IDS" | sed -n 1p)
PRODUCT_ID_2=$(echo "$PRODUCT_IDS" | sed -n 2p)

if [ -n "$PRODUCT_ID_1" ] && [ -n "$PRODUCT_ID_2" ]; then
    ORDER_DATA="{
        \"customerName\": \"Test Customer\",
        \"orderType\": \"DINE_IN\",
        \"tableNumber\": \"5\",
        \"items\": [
            {\"productId\": \"$PRODUCT_ID_1\", \"quantity\": 1},
            {\"productId\": \"$PRODUCT_ID_2\", \"quantity\": 1}
        ],
        \"paymentMethod\": \"CASH\"
    }"
    
    test_endpoint "Create order" "POST" "/orders" "$CASHIER_TOKEN" "$ORDER_DATA"
fi
echo ""

# ===========================
# 8. KITCHEN
# ===========================
echo "8️⃣  Kitchen Module"
echo "----------------------------"
test_endpoint "Get kitchen orders" "GET" "/kitchen/orders" "$CASHIER_TOKEN" ""
test_endpoint "Get completed orders" "GET" "/kitchen/orders/completed" "$CASHIER_TOKEN" ""
echo ""

# ===========================
# 9. REPORTS
# ===========================
echo "9️⃣  Reports Module"
echo "----------------------------"
test_endpoint "Daily sales report" "GET" "/reports/sales/daily" "$ADMIN_TOKEN" ""
test_endpoint "Monthly sales report" "GET" "/reports/sales/monthly?year=2026&month=2" "$ADMIN_TOKEN" ""
test_endpoint "Best selling products" "GET" "/reports/products/best-selling?limit=5" "$ADMIN_TOKEN" ""
test_endpoint "Stock report" "GET" "/reports/stocks" "$ADMIN_TOKEN" ""
echo ""

# ===========================
# SUMMARY
# ===========================
echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
