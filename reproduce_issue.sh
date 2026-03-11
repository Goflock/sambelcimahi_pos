#!/bin/bash
TOKEN=$(cat backend/token_ADMIN.txt)
echo "Testing with missing year and month..."
curl -v -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/reports/sales/monthly"
echo -e "\n\nTesting with invalid year and month..."
curl -v -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/reports/sales/monthly?year=invalid&month=invalid"
