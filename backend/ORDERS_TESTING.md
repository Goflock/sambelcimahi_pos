# Orders Module - Testing Guide

## 🧪 Test Orders API

### 1. Get Token

```bash
cd /home/robby/project/Sambelcimahi/cimahi-pos/backend

# Get kasir token
./test-login.sh

# Token tersimpan di token_CASHIER.txt
```

### 2. Create Order

```bash
# Get product IDs first
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" \
  | jq '.data[0:2] | .[] | {id, name, price}'

# Create order (ganti PRODUCT_ID_1 dan PRODUCT_ID_2 dengan ID asli)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "orderType": "DINE_IN",
    "tableNumber": "5",
    "items": [
      {
        "productId": "PRODUCT_ID_1",
        "quantity": 2,
        "notes": "Extra pedas"
      },
      {
        "productId": "PRODUCT_ID_2",
        "quantity": 1
      }
    ],
    "paymentMethod": "CASH",
    "discount": 0,
    "tax": 0
  }' | jq .
```

### 3. Get All Orders

```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" | jq .
```

### 4. Get Order Detail

```bash
# Ganti ORDER_ID dengan ID order yang dibuat
curl http://localhost:3000/api/orders/ORDER_ID \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" | jq .
```

### 5. Complete Order (Admin/Owner only)

```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID/complete \
  -H "Authorization: Bearer $(cat token_ADMIN.txt)" | jq .
```

### 6. Cancel Order (Admin/Owner only)

```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer $(cat token_ADMIN.txt)" | jq .
```

---

## 📋 Test Scenarios

### Scenario 1: Happy Path

1. ✅ Create order dengan 2 items
2. ✅ Check stock berkurang
3. ✅ Check stock_movements tercatat
4. ✅ Get order list
5. ✅ Complete order

### Scenario 2: Insufficient Stock

1. ❌ Create order dengan quantity > stock
2. ✅ Error: "Stok tidak mencukupi"

### Scenario 3: Cancel Order

1. ✅ Create order
2. ✅ Cancel order
3. ✅ Check stock kembali

---

## 🔍 Verify in Database

```bash
# Check orders
psql -U postgres -d cimahi_pos -c "SELECT order_number, customer_name, total, status FROM orders ORDER BY created_at DESC LIMIT 5;"

# Check order items
psql -U postgres -d cimahi_pos -c "SELECT oi.quantity, p.name, oi.subtotal FROM order_items oi JOIN products p ON oi.product_id = p.id LIMIT 10;"

# Check stock movements
psql -U postgres -d cimahi_pos -c "SELECT sm.type, sm.quantity, p.name, sm.notes FROM stock_movements sm JOIN products p ON sm.product_id = p.id ORDER BY sm.created_at DESC LIMIT 10;"

# Check current stock
psql -U postgres -d cimahi_pos -c "SELECT p.name, s.quantity FROM products p JOIN stocks s ON p.id = s.product_id;"
```

---

## ✅ Expected Results

### Create Order Response:

```json
{
  "success": true,
  "message": "Order berhasil dibuat",
  "data": {
    "id": "uuid",
    "orderNumber": "ORD202602180001",
    "customerName": "John Doe",
    "orderType": "DINE_IN",
    "tableNumber": "5",
    "subtotal": 50000,
    "tax": 0,
    "discount": 0,
    "total": 50000,
    "paymentMethod": "CASH",
    "status": "PENDING",
    "orderItems": [
      {
        "product": {
          "name": "Nasi Goreng Spesial",
          "price": "25000.00"
        },
        "quantity": 2,
        "subtotal": 50000
      }
    ]
  }
}
```

---

## 🚀 Next: Update Frontend

Setelah Orders API berfungsi, update frontend:

1. **Update API client** - Add orders endpoints
2. **Update PaymentModal** - Call create order API
3. **Test checkout flow** - End-to-end
