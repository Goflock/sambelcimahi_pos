# Quick Validation Test - Cimahi POS

## ✅ Langkah Cepat untuk Test Server

### 1. Cek apakah server sudah running

```bash
# Cek di terminal lain
curl http://localhost:3000/api
```

**Expected Response:**
```json
{
  "message": "Cimahi POS API",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "..."
}
```

### 2. Test Login

```bash
# Login sebagai Kasir
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@cimahipos.com","password":"cashier123"}'
```

Simpan `access_token` dari response.

### 3. Test Protected Endpoint

```bash
# Ganti YOUR_TOKEN dengan token dari step 2
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Buka Swagger Docs

```
http://localhost:3000/docs
```

---

## 🐛 Jika Server Tidak Bisa Start

Coba alternatif berikut:

### Opsi 1: Build dulu baru start

```bash
npm run build
npm run start:prod
```

### Opsi 2: Start tanpa watch mode

```bash
npx nest start
```

### Opsi 3: Cek error log

```bash
# Lihat error detail
npm run start:dev 2>&1 | tee server.log
```

---

## 📊 Validation Checklist

- [x] Database created
- [x] Migration completed
- [x] Database seeded
- [ ] Server started successfully
- [ ] Health endpoint works
- [ ] Login works
- [ ] Protected endpoints work
- [ ] Swagger docs accessible
