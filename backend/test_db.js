const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('Connecting to db...');
    try {
        await prisma.$connect();
        console.log('Connected! Fetching 1 product...');
        const result = await prisma.product.findFirst();
        console.log('Fetched:', result?.id);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
        console.log('Done.');
    }
}
check();
