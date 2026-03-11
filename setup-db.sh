#!/bin/bash
# Script setup PostgreSQL + seed untuk Fedora Linux
set -e

echo "=========================================="
echo "  Setup PostgreSQL + Seed Cimahi POS"
echo "=========================================="

# 1. Inisialisasi database cluster (khusus Fedora)
echo ""
echo "Step 1: Inisialisasi PostgreSQL data directory..."
if sudo postgresql-setup --initdb 2>&1; then
    echo "✅ Inisialisasi berhasil"
else
    echo "⚠️  Sudah diinisialisasi sebelumnya, lanjut..."
fi

# 2. Start PostgreSQL
echo ""
echo "Step 2: Start PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sleep 2

# Cek apakah running
if pg_isready -h localhost -p 5432; then
    echo "✅ PostgreSQL aktif di port 5432"
else
    echo "❌ PostgreSQL gagal start!"
    sudo systemctl status postgresql --no-pager
    exit 1
fi

# 3. Buat database dan user
echo ""
echo "Step 3: Setup database cimahi_pos..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='cimahi_pos'" | grep -q 1 && \
    echo "⚠️  Database sudah ada, skip..." || \
    sudo -u postgres createdb cimahi_pos && echo "✅ Database cimahi_pos dibuat"

# Set password postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" && \
    echo "✅ Password postgres diset ke 'postgres'"

# 4. Allow password auth (update pg_hba.conf jika perlu)
PG_HBA=$(sudo find /var/lib/pgsql -name "pg_hba.conf" 2>/dev/null | head -1)
if [ -n "$PG_HBA" ]; then
    echo ""
    echo "Step 4: Konfigurasi auth..."
    if sudo grep -q "^host.*all.*all.*127.0.0.1.*ident" "$PG_HBA" 2>/dev/null; then
        sudo sed -i 's/^host.*all.*all.*127.0.0.1.*ident/host    all             all             127.0.0.1\/32            md5/' "$PG_HBA"
        sudo sed -i 's/^host.*all.*all.*::1\/128.*ident/host    all             all             ::1\/128                 md5/' "$PG_HBA"
        sudo systemctl reload postgresql
        echo "✅ pg_hba.conf diupdate ke md5 auth"
    else
        echo "✅ Auth config sudah ok"
    fi
fi

# 5. Jalankan Prisma migrate dan seed
echo ""
echo "Step 5: Jalankan Prisma migrate..."
cd /home/robby/project/Sambelcimahi/cimahi-pos/backend
npx prisma migrate deploy 2>&1 && echo "✅ Migrasi berhasil" || echo "⚠️  Migrasi gagal, coba prisma db push..."
npx prisma db push 2>&1 && echo "✅ Schema sync berhasil"

echo ""
echo "Step 6: Seed database..."
npm run prisma:seed 2>&1 && echo "✅ Seed berhasil!" || echo "❌ Seed gagal, cek error di atas"

echo ""
echo "=========================================="
echo "  SELESAI! Akun login:"
echo "  Owner : owner@cimahipos.com / owner123"
echo "  Admin : admin@cimahipos.com / admin123"
echo "  Kasir : kasir@cimahipos.com / cashier123"
echo "=========================================="
echo ""
echo "Sekarang jalankan backend:"
echo "  cd /home/robby/project/Sambelcimahi/cimahi-pos/backend"
echo "  npm run start:dev"
