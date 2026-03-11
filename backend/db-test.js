const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        await prisma.$connect();
        console.log('DB Connected!');
        await prisma.$disconnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
main();
