# 🔐 Panduan Test Login - Cimahi POS

## Quick Start

### Opsi 1: Menggunakan Script (Paling Mudah!)

```bash
cd /home/robby/project/Sambelcimahi/cimahi-pos/backend
./test-login.sh
```

Script ini akan:
- ✅ Test login untuk 3 roles (Owner, Admin, Kasir)
- ✅ Menampilkan token yang dihasilkan
- ✅ Menyimpan token ke file untuk digunakan nanti

---

### Opsi 2: Manual dengan cURL

#### Login sebagai Kasir
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kasir@cimahipos.com",
    "password": "cashier123"
  }' | jq .
```

#### Login sebagai Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cimahipos.com",
    "password": "admin123"
  }' | jq .
```

#### Login sebagai Owner
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@cimahipos.com",
    "password": "owner123"
  }' | jq .
```

---

### Opsi 3: Swagger UI (Paling Visual!)

1. Buka browser: http://localhost:3000/docs
2. Cari section **auth**
3. Klik endpoint `POST /auth/login`
4. Klik tombol **"Try it out"**
5. Edit request body:
   ```json
   {
     "email": "kasir@cimahipos.com",
     "password": "cashier123"
   }
   ```
6. Klik **"Execute"**
7. Lihat response dengan `access_token`

---

## Response yang Diharapkan

### ✅ Login Berhasil

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imthc2lyQGNpbWFoaXBvcy5jb20iLCJzdWIiOiJ1dWlkIiwicm9sZSI6IkNBU0hJRVIiLCJpYXQiOjE3MDg...",
    "user": {
      "id": "uuid-here",
      "name": "Kasir 1",
      "email": "kasir@cimahipos.com",
      "role": "CASHIER"
    }
  }
}
```

### ❌ Login Gagal (Password Salah)

```json
{
  "success": false,
  "statusCode": 401,
  "message": ["Email atau password salah"],
  "timestamp": "2026-02-18T01:35:21.000Z"
}
```

---

## Menggunakan Token untuk Test Endpoint Lain

Setelah login, copy `access_token` dan gunakan untuk test endpoint protected:

### Test Get Products
```bash
TOKEN="paste-token-disini"

curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Atau gunakan token yang tersimpan (jika pakai script)
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)"
```

---

## Test RBAC (Role-Based Access Control)

### Test 1: Kasir TIDAK bisa akses /users
```bash
# Login sebagai kasir
KASIR_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@cimahipos.com","password":"cashier123"}' \
  | jq -r '.data.access_token')

# Coba akses /users (harus ditolak)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $KASIR_TOKEN"

# Expected: 403 Forbidden
```

### Test 2: Admin BISA akses /users
```bash
# Login sebagai admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cimahipos.com","password":"admin123"}' \
  | jq -r '.data.access_token')

# Akses /users (harus berhasil)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 200 OK dengan list users
```

---

## Credentials untuk Testing

| Role | Email | Password |
|------|-------|----------|
| **Owner** | owner@cimahipos.com | owner123 |
| **Admin** | admin@cimahipos.com | admin123 |
| **Kasir** | kasir@cimahipos.com | cashier123 |

---

## Troubleshooting

### Error: Connection refused
**Masalah:** Server belum running

**Solusi:**
```bash
cd /home/robby/project/Sambelcimahi/cimahi-pos/backend
npm run start:dev
```

### Error: 401 Unauthorized
**Masalah:** Email atau password salah

**Solusi:** Cek credentials di tabel di atas

### Error: jq command not found
**Masalah:** jq belum terinstall

**Solusi:**
```bash
sudo apt install jq
# atau tanpa jq:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@cimahipos.com","password":"cashier123"}'
```

---

## Advanced: One-liner untuk Extract Token

```bash
# Simpan token ke variable
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@cimahipos.com","password":"cashier123"}' \
  | jq -r '.data.access_token')

# Gunakan token
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

**Happy Testing! 🚀**
