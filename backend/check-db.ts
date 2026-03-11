import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB connection...');
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                name: true
            }
        });
        console.log('Users in DB:', users.length);
        if (users.length > 0) {
            console.log(users);
        } else {
            console.log('No users found. Did you run the seed?');
        }
    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
