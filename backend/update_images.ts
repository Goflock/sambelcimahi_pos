import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mapping = [
    { keyword: 'ayam bakar', url: 'https://i.ibb.co.com/gZ9vDN7Z/ayambakar.jpg' },
    { keyword: 'ayam kampung', url: 'https://i.ibb.co.com/jZWGTtsb/ayamkampung.jpg' },
    { keyword: 'nasi', url: 'https://i.ibb.co.com/60HhNGbz/bakul.jpg' },
    { keyword: 'bakwan', url: 'https://i.ibb.co.com/2089fVQ3/bakwantempe.jpg' },
    { keyword: 'tempe', url: 'https://i.ibb.co.com/2089fVQ3/bakwantempe.jpg' },
    { keyword: 'cumi', url: 'https://i.ibb.co.com/rRVjq0Rs/cumiasin.jpg' },
    { keyword: 'kembung bakar', url: 'https://i.ibb.co.com/LhBXh4WM/ikankembungbakar.jpg' },
    { keyword: 'mas', url: 'https://i.ibb.co.com/qLKPd46H/ikanmasacar.jpg' },
    { keyword: 'nila bakar', url: 'https://i.ibb.co.com/FbFQ98BM/ikannilabakar.jpg' },
    { keyword: 'nila goreng', url: 'https://i.ibb.co.com/C5Bz1qkL/ikannilagoreng.jpg' },
    { keyword: 'jengkol', url: 'https://i.ibb.co.com/bRQ0CytP/jengkol.jpg' },
    { keyword: 'kembang paya', url: 'https://i.ibb.co.com/Dfx9jcSp/kembangpaya.jpg' },
    { keyword: 'pepes', url: 'https://i.ibb.co.com/d0kyk80d/pepesikan.jpg' },
    { keyword: 'jamur', url: 'https://i.ibb.co.com/Fq8HL4y7/tumisjamur.jpg' },
];

async function main() {
    console.log('Connecting to Prisma...');
    const products = await prisma.product.findMany();
    console.log('Found', products.length, 'products');

    let updatedCount = 0;
    for (const product of products) {
        const nameLower = product.name.toLowerCase();

        // Find matching keyword
        const match = mapping.find(m => nameLower.includes(m.keyword));

        if (match) {
            console.log(`Updating "${product.name}" with URL ${match.url}`);
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl: match.url }
            });
            updatedCount++;
        } else {
            console.log(`No match for: ${product.name}`);
        }
    }

    console.log(`Updated ${updatedCount} products successfully.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
