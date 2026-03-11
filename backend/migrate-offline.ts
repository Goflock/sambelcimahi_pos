import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting manual migration via PrismaClient...');

    try {
        console.log('Adding local_id column...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN "local_id" TEXT;`);
    } catch (e: any) { console.log('Already exists or error:', e.message); }

    try {
        console.log('Adding offline_sync_at column...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN "offline_sync_at" TIMESTAMP(3);`);
    } catch (e: any) { console.log('Already exists or error:', e.message); }

    try {
        console.log('Adding unique constraint on local_id...');
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "orders_local_id_key" ON "orders"("local_id");`);
    } catch (e: any) { console.log('Already exists or error:', e.message); }

    console.log('Migration complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
