/**
 * Railway Production Seed Script (JavaScript version)
 * Dijalankan otomatis saat deploy ke Railway
 * Hanya seed jika database masih kosong (idempotent)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Checking if seed is needed...');

    // Cek apakah sudah ada user (idempotent - tidak seed ulang jika sudah ada)
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        console.log(`✅ Database already has ${userCount} users. Skipping seed.`);
        return;
    }

    console.log('🌱 Starting fresh database seed...');

    // Create Roles
    const ownerRole = await prisma.role.create({
        data: { name: 'Owner', description: 'System Owner' }
    });
    const adminRole = await prisma.role.create({
        data: { name: 'Admin', description: 'Administrator' }
    });
    const cashierRole = await prisma.role.create({
        data: { name: 'Cashier', description: 'Cashier Staff' }
    });

    // Create Warehouse
    const mainWarehouse = await prisma.warehouse.create({
        data: { name: 'Main Warehouse', address: 'Cimahi Central' }
    });

    // Create Units
    await prisma.unit.createMany({
        data: [
            { name: 'Pcs', symbol: 'pcs' },
            { name: 'Kg', symbol: 'kg' },
            { name: 'Box', symbol: 'box' },
        ]
    });

    // Create users
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const cashierPassword = await bcrypt.hash('cashier123', 10);

    await prisma.user.create({
        data: {
            name: 'Owner Cimahi',
            email: 'owner@cimahipos.com',
            password: ownerPassword,
            role: 'OWNER',
            roleId: ownerRole.id,
            isActive: true,
        },
    });

    await prisma.user.create({
        data: {
            name: 'Admin Cimahi',
            email: 'admin@cimahipos.com',
            password: adminPassword,
            role: 'ADMIN',
            roleId: adminRole.id,
            isActive: true,
        },
    });

    await prisma.user.create({
        data: {
            name: 'Kasir 1',
            email: 'kasir@cimahipos.com',
            password: cashierPassword,
            role: 'CASHIER',
            roleId: cashierRole.id,
            isActive: true,
        },
    });

    console.log('✅ Users created');

    // Create categories
    const makanan = await prisma.category.create({
        data: { name: 'Makanan', description: 'Menu makanan' },
    });
    const minuman = await prisma.category.create({
        data: { name: 'Minuman', description: 'Menu minuman' },
    });
    const snack = await prisma.category.create({
        data: { name: 'Snack', description: 'Camilan dan appetizer' },
    });

    console.log('✅ Categories created');

    // Create products with stocks
    const products = [
        { name: 'Nasi Goreng Spesial', sku: 'MKN-001', categoryId: makanan.id, price: 25000, cost: 12000, description: 'Nasi goreng dengan ayam, telur, dan sayuran', isAvailable: true, stock: 50 },
        { name: 'Mie Goreng', sku: 'MKN-002', categoryId: makanan.id, price: 20000, cost: 10000, description: 'Mie goreng spesial', isAvailable: true, stock: 40 },
        { name: 'Ayam Goreng', sku: 'MKN-003', categoryId: makanan.id, price: 22000, cost: 11000, description: 'Ayam goreng crispy dengan sambal', isAvailable: true, stock: 30 },
        { name: 'Es Teh Manis', sku: 'MIN-001', categoryId: minuman.id, price: 5000, cost: 2000, description: 'Es teh manis segar', isAvailable: true, stock: 100 },
        { name: 'Es Jeruk', sku: 'MIN-002', categoryId: minuman.id, price: 8000, cost: 3000, description: 'Es jeruk peras segar', isAvailable: true, stock: 80 },
        { name: 'Kopi Hitam', sku: 'MIN-003', categoryId: minuman.id, price: 10000, cost: 4000, description: 'Kopi hitam original', isAvailable: true, stock: 60 },
        { name: 'Kentang Goreng', sku: 'SNK-001', categoryId: snack.id, price: 12000, cost: 5000, description: 'Kentang goreng crispy', isAvailable: true, stock: 5 },
        { name: 'Tahu Crispy', sku: 'SNK-002', categoryId: snack.id, price: 8000, cost: 3000, description: 'Tahu goreng crispy', isAvailable: true, stock: 25 },
    ];

    for (const productData of products) {
        const { stock: stockQty, ...productInfo } = productData;
        const product = await prisma.product.create({ data: productInfo });
        await prisma.stock.create({
            data: {
                productId: product.id,
                quantity: stockQty,
                minStock: 10,
                warehouseId: mainWarehouse.id,
            },
        });
    }

    console.log('✅ Products and stocks created');
    console.log('');
    console.log('📋 Seed Summary:');
    console.log('==================');
    console.log('👤 Users:');
    console.log('   - Owner: owner@cimahipos.com / owner123');
    console.log('   - Admin: admin@cimahipos.com / admin123');
    console.log('   - Kasir: kasir@cimahipos.com / cashier123');
    console.log('📦 Categories: 3 (Makanan, Minuman, Snack)');
    console.log('🍽️  Products: 8');
    console.log('📊 Stocks: 8');
    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
