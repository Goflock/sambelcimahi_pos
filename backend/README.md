# Cimahi POS Backend

Sistem Point of Sales (POS) berbasis web untuk UMKM (Warung, Café, Restoran Kecil) dengan fitur lengkap untuk kasir, dapur, manajemen stok, dan laporan.

## 🚀 Fitur Utama

- ✅ **Authentication & Authorization** (JWT + Role-based)
- ✅ **Kasir** (Transaksi penjualan)
- ✅ **Kitchen Display System (KDS)** dengan WebSocket
- ✅ **Manajemen Stok** + Stok Opname
- ✅ **Laporan Penjualan** (Harian, Bulanan, Produk Terlaris)
- ✅ **API Documentation** (Swagger)

## 📚 Tech Stack

- **Backend**: NestJS + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Realtime**: Socket.IO
- **Authentication**: JWT + Passport
- **API Docs**: Swagger

## 🛠️ Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm atau yarn

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Buat database PostgreSQL:

```bash
createdb cimahi_pos
```

Atau via psql:

```sql
CREATE DATABASE cimahi_pos;
```

### 3. Configure Environment

Copy `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/cimahi_pos?schema=public"
JWT_SECRET=your-super-secret-jwt-key
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed Database

```bash
npm run prisma:seed
```

**Default Users:**
- Owner: `owner@cimahipos.com` / `owner123`
- Admin: `admin@cimahipos.com` / `admin123`
- Kasir: `kasir@cimahipos.com` / `cashier123`

### 6. Start Development Server

```bash
npm run start:dev
```

Server akan berjalan di:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs

## 📖 API Documentation

Setelah server berjalan, buka Swagger documentation di:

```
http://localhost:3000/docs
```

### Authentication

Semua endpoint (kecuali `/auth/login`) memerlukan JWT token.

**Login:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "kasir@cimahipos.com",
  "password": "cashier123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Kasir 1",
      "email": "kasir@cimahipos.com",
      "role": "CASHIER"
    }
  }
}
```

Gunakan token di header:

```
Authorization: Bearer <access_token>
```

## 🔐 Role & Permissions

| Endpoint | OWNER | ADMIN | CASHIER |
|----------|-------|-------|---------|
| **Users**||||
| GET /users | ✅ | ✅ | ⛔ |
| POST /users | ✅ | ⛔ | ⛔ |
| PATCH /users | ✅ | ⛔ | ⛔ |
| DELETE /users | ✅ | ⛔ | ⛔ |
| **Products**||||
| GET /products | ✅ | ✅ | ✅ |
| **Orders**||||
| POST /orders | ✅ | ✅ | ✅ |
| **Kitchen**||||
| GET /kitchen | ✅ | ✅ | ⛔ |
| **Reports**||||
| GET /reports/* | ✅ | ✅ | ⛔ |

## 📂 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── categories/        # Product categories
│   ├── products/          # Product management
│   ├── stocks/            # Stock management
│   ├── orders/            # Order transactions
│   ├── kitchen/           # Kitchen Display System
│   ├── reports/           # Reports & analytics
│   ├── prisma/            # Prisma service
│   ├── common/            # Shared utilities
│   │   ├── decorators/    # Custom decorators
│   │   ├── filters/       # Exception filters
│   │   ├── guards/        # Auth guards
│   │   └── exceptions/    # Custom exceptions
│   ├── app.module.ts
│   └── main.ts
├── .env
├── .env.example
├── package.json
└── README.md
```

## 🗃️ Database Schema

Lihat ERD lengkap di [DESAIN_SISTEM_POS.md](../DESAIN_SISTEM_POS.md#1-erd-entity-relationship-diagram)

**Main Tables:**
- `users` - User accounts
- `categories` - Product categories
- `products` - Menu/products
- `stocks` - Current stock levels
- `stock_movements` - Stock history (audit trail)
- `orders` - Sales transactions
- `order_items` - Order details
- `kitchen_orders` - Kitchen display queue
- `stock_opnames` - Stock taking activities

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Production Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start:prod
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/cimahi_pos"
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRATION=7d
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Run Migrations (Production)

```bash
npx prisma migrate deploy
```

### Deployment Options

1. **VPS (Ubuntu/Debian)**
   - Install Node.js, PostgreSQL, PM2
   - Clone repo, install dependencies
   - Setup systemd service atau PM2
   - Configure Nginx reverse proxy

2. **Docker**
   - Create Dockerfile
   - Use docker-compose for multi-container setup
   - Include PostgreSQL service

3. **Cloud Platform**
   - Heroku
   - Railway
   - Render
   - AWS EC2 + RDS

## 📝 Scripts

```bash
# Development
npm run start:dev          # Start dengan hot-reload
npm run start:debug        # Start dengan debugger

# Build
npm run build              # Build production

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio (GUI)
npm run prisma:seed        # Seed database

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier format
```

## 🐛 Troubleshooting

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Solusi:**
- Pastikan PostgreSQL running
- Check `DATABASE_URL` di `.env`
- Test koneksi: `psql -U postgres -d cimahi_pos`

### Prisma Client Error

```
Error: Cannot find module '@prisma/client'
```

**Solusi:**

```bash
npx prisma generate
```

### Migration Error

```
Error: Migration failed
```

**Solusi:**

```bash
npx prisma migrate reset
npm run prisma:seed
```

## 📞 Support

Untuk pertanyaan atau bantuan, hubungi:
- Email: support@cimahipos.com
- Documentation: [DESAIN_SISTEM_POS.md](../DESAIN_SISTEM_POS.md)

## 📄 License

MIT License - Copyright (c) 2026 Cimahi POS

---

**Dibuat dengan ❤️ untuk UMKM Indonesia**
