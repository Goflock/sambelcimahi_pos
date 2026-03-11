# Cara Mendapatkan Token & Lanjutkan Backend Module

## 🔑 Cara 1: Mendapatkan Token via cURL

### Login dan Simpan Token

```bash
# Login sebagai Kasir
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@cimahipos.com","password":"cashier123"}' \
  | jq -r '.data.access_token' > kasir_token.txt

# Lihat token
cat kasir_token.txt
```

### Gunakan Token untuk Test Endpoint

```bash
# Simpan token ke variable
TOKEN=$(cat kasir_token.txt)

# Test endpoint dengan token
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 🔑 Cara 2: Menggunakan Script yang Sudah Ada

```bash
cd /home/robby/project/Sambelcimahi/cimahi-pos/backend

# Jalankan test-login.sh (sudah otomatis save token)
./test-login.sh

# Token tersimpan di:
# - token_CASHIER.txt
# - token_ADMIN.txt
# - token_OWNER.txt

# Gunakan token
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" | jq .
```

---

## 🔑 Cara 3: Menggunakan Postman/Thunder Client

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "email": "kasir@cimahipos.com",
       "password": "cashier123"
     }
     ```

2. **Copy Token** dari response `data.access_token`

3. **Gunakan Token:**
   - Headers: `Authorization: Bearer {your-token}`

---

## 📋 Module Backend yang Perlu Dilanjutkan

### Priority 1: Orders Module ⚡

**File yang perlu dibuat:**

1. **DTOs:**
   - `src/orders/dto/create-order.dto.ts`
   - `src/orders/dto/update-order.dto.ts`

2. **Service:**
   - `src/orders/orders.service.ts` - Business logic

3. **Controller:**
   - `src/orders/orders.controller.ts` - API endpoints

**Endpoints yang perlu dibuat:**
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order detail
- `PATCH /api/orders/:id/complete` - Complete order
- `PATCH /api/orders/:id/cancel` - Cancel order

---

### Priority 2: Stocks Module

**Endpoints:**
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/low` - Get low stock items
- `POST /api/stocks/movements` - Record stock movement
- `POST /api/stocks/opname` - Create stock opname

---

### Priority 3: Kitchen Module (WebSocket)

**Endpoints:**
- `GET /api/kitchen/orders` - Get pending orders
- `PATCH /api/kitchen/orders/:id/status` - Update order status
- WebSocket: `/ws/kitchen` - Real-time updates

---

### Priority 4: Reports Module

**Endpoints:**
- `GET /api/reports/sales/daily` - Daily sales
- `GET /api/reports/sales/monthly` - Monthly sales
- `GET /api/reports/products/best-selling` - Best sellers
- `GET /api/reports/stocks/low` - Low stock report

---

## 🚀 Langkah Selanjutnya

### Step 1: Implement Orders Module

```bash
cd /home/robby/project/Sambelcimahi/cimahi-pos/backend
```

Saya akan buatkan:
1. DTOs untuk create order
2. Orders service dengan transaction
3. Orders controller dengan endpoints
4. Integration dengan stocks (reduce stock)

### Step 2: Test Orders API

```bash
# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "orderType": "DINE_IN",
    "tableNumber": "5",
    "items": [
      {"productId": "uuid", "quantity": 2, "notes": "Extra pedas"}
    ],
    "paymentMethod": "CASH"
  }'
```

### Step 3: Update Frontend

Setelah backend Orders selesai, frontend bisa:
- Create order saat checkout
- Simpan order ke database
- Reduce stock otomatis
- Generate order number

---

## 🔧 Quick Commands

```bash
# Start backend (jika belum running)
cd backend && npm run start:dev

# Get token
./test-login.sh

# Test dengan token
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" | jq .
```

---

**Mau saya lanjutkan implement Orders Module sekarang?** 🚀
