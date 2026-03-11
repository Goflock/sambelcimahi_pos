# Panduan Staging & Validation - Cimahi POS

## 📋 Prerequisites Check

Sebelum memulai, pastikan semua tools sudah terinstall:

```bash
# Check Node.js (minimal v18)
node --version

# Check npm
npm --version

# Check PostgreSQL
psql --version

# Check apakah PostgreSQL service running
sudo systemctl status postgresql
# atau
pg_isready
```

---

## 🚀 Step-by-Step Staging & Validation

### **Step 1: Setup PostgreSQL Database**

#### 1.1 Start PostgreSQL Service (jika belum running)

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Enable auto-start on boot
sudo systemctl enable postgresql

# Verify status
sudo systemctl status postgresql
```

#### 1.2 Buat Database

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Di dalam psql, jalankan:
CREATE DATABASE cimahi_pos;

# Buat user jika perlu (opsional)
CREATE USER cimahi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cimahi_pos TO cimahi_user;

# Exit psql
\q
```

**Atau menggunakan command line langsung:**

```bash
sudo -u postgres createdb cimahi_pos
```

#### 1.3 Verify Database Connection

```bash
# Test koneksi
psql -U postgres -d cimahi_pos -c "SELECT version();"
```

---

### **Step 2: Install Dependencies**

```bash
# Masuk ke directory backend
cd /home/robby/project/Sambelcimahi/cimahi-pos/backend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

---

### **Step 3: Configure Environment**

Edit file `.env` sesuai konfigurasi database Anda:

```bash
# Edit .env
nano .env
```

Pastikan `DATABASE_URL` sesuai:

```env
# Jika menggunakan default postgres user
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cimahi_pos?schema=public"

# Atau jika sudah buat user custom
DATABASE_URL="postgresql://cimahi_user:your_password@localhost:5432/cimahi_pos?schema=public"
```

**Test koneksi database:**

```bash
# Generate Prisma Client
npx prisma generate

# Test koneksi
npx prisma db pull --force
```

---

### **Step 4: Run Database Migration**

```bash
# Jalankan migration untuk create tables
npx prisma migrate dev --name init

# Verify tables created
npx prisma studio
# Buka browser di http://localhost:5555
```

**Expected Output:**

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "cimahi_pos"

Applying migration `20260217_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260217_init/
      └─ migration.sql

✔ Generated Prisma Client
```

---

### **Step 5: Seed Database**

```bash
# Jalankan seed untuk populate initial data
npm run prisma:seed
```

**Expected Output:**

```
🌱 Starting database seed...
✅ Users created
✅ Categories created
✅ Products and stocks created

📋 Seed Summary:
==================
👤 Users:
   - Owner: owner@cimahipos.com / owner123
   - Admin: admin@cimahipos.com / admin123
   - Kasir: kasir@cimahipos.com / cashier123

📦 Categories: 3 (Makanan, Minuman, Snack)
🍽️  Products: 8
📊 Stocks: 8

✅ Database seeded successfully!
```

---

### **Step 6: Start Development Server**

```bash
# Start server dengan hot-reload
npm run start:dev
```

**Expected Output:**

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [InstanceLoader] PrismaModule dependencies initialized
[Nest] INFO [InstanceLoader] ConfigModule dependencies initialized
...
✅ Database connected
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/docs
```

---

## ✅ Validation Checklist

### **1. Health Check**

```bash
# Test health endpoint
curl http://localhost:3000/api

# Expected response:
# {
#   "message": "Cimahi POS API",
#   "version": "1.0.0",
#   "status": "running",
#   "timestamp": "2026-02-17T..."
# }
```

### **2. API Documentation**

Buka browser:

```
http://localhost:3000/docs
```

✅ Pastikan Swagger UI muncul dengan semua endpoints

---

### **3. Authentication Test**

#### 3.1 Login sebagai Kasir

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kasir@cimahipos.com",
    "password": "cashier123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "Kasir 1",
      "email": "kasir@cimahipos.com",
      "role": "CASHIER"
    }
  }
}
```

✅ **Simpan `access_token` untuk test berikutnya**

#### 3.2 Login sebagai Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cimahipos.com",
    "password": "admin123"
  }'
```

#### 3.3 Login sebagai Owner

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@cimahipos.com",
    "password": "owner123"
  }'
```

---

### **4. Protected Endpoints Test**

#### 4.1 Get All Products (dengan token)

```bash
# Ganti YOUR_TOKEN dengan access_token dari login
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nasi Goreng Spesial",
      "sku": "MKN-001",
      "price": "25000.00",
      "cost": "12000.00",
      "isAvailable": true,
      "category": {
        "id": "uuid",
        "name": "Makanan"
      },
      "stock": {
        "quantity": 50,
        "minStock": 10
      }
    },
    ...
  ]
}
```

#### 4.2 Get All Categories

```bash
curl -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.3 Get All Users (hanya OWNER/ADMIN)

```bash
# Login sebagai owner dulu, ambil token
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer OWNER_TOKEN"
```

**Expected:** ✅ Success jika menggunakan OWNER/ADMIN token

```bash
# Test dengan CASHIER token (harus ditolak)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer CASHIER_TOKEN"
```

**Expected:** ❌ 403 Forbidden

---

### **5. Database Validation**

#### 5.1 Cek Data via Prisma Studio

```bash
npx prisma studio
```

Buka http://localhost:5555 dan verify:

- ✅ 3 users (owner, admin, kasir)
- ✅ 3 categories
- ✅ 8 products
- ✅ 8 stocks

#### 5.2 Cek via psql

```bash
psql -U postgres -d cimahi_pos
```

```sql
-- Cek jumlah users
SELECT COUNT(*) FROM users;

-- Cek products dengan stock
SELECT p.name, p.price, s.quantity 
FROM products p 
LEFT JOIN stocks s ON p.id = s.product_id;

-- Cek low stock items
SELECT p.name, s.quantity, s.min_stock 
FROM products p 
LEFT JOIN stocks s ON p.id = s.product_id 
WHERE s.quantity < s.min_stock;

-- Exit
\q
```

---

## 🧪 Automated Testing

### Run Unit Tests

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

---

## 🐛 Troubleshooting

### Issue 1: Database Connection Failed

**Error:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solution:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start jika belum running
sudo systemctl start postgresql

# Test koneksi
pg_isready
```

### Issue 2: Migration Failed

**Error:**
```
Error: Migration failed
```

**Solution:**

```bash
# Reset database
npx prisma migrate reset

# Re-run migration
npx prisma migrate dev

# Re-seed
npm run prisma:seed
```

### Issue 3: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Atau gunakan port lain di .env
PORT=3001
```

### Issue 4: Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**

```bash
npx prisma generate
npm install
```

---

## 📊 Validation Checklist Summary

Gunakan checklist ini untuk memastikan semua berjalan dengan baik:

- [ ] PostgreSQL service running
- [ ] Database `cimahi_pos` created
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured correctly
- [ ] Migration completed (`npx prisma migrate dev`)
- [ ] Database seeded (`npm run prisma:seed`)
- [ ] Server started (`npm run start:dev`)
- [ ] Health check endpoint works (`GET /api`)
- [ ] Swagger docs accessible (`http://localhost:3000/docs`)
- [ ] Login works untuk 3 roles (owner, admin, kasir)
- [ ] Protected endpoints require authentication
- [ ] Role-based access control works
- [ ] Products API returns data
- [ ] Categories API returns data
- [ ] Prisma Studio shows correct data

---

## 🚀 Next Steps After Validation

Setelah semua validation passed:

1. **Implement Orders Module** - Transaction flow
2. **Implement Kitchen Module** - WebSocket untuk KDS
3. **Implement Reports Module** - Analytics & laporan
4. **Write Integration Tests** - E2E testing
5. **Setup CI/CD** - Automated deployment
6. **Deploy to Staging** - VPS atau cloud platform

---

## 📞 Support

Jika ada masalah saat validation, check:
- Server logs di terminal
- Database logs: `sudo journalctl -u postgresql -n 50`
- Prisma Studio untuk inspect data
- Swagger docs untuk test endpoints

---

**Happy Testing! 🎉**
