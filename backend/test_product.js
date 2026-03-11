async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'password'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.access_token || loginData.access_token;
        console.log('Got token:', token ? 'yes' : 'no');

        console.log('Fetching products...');
        const prodRes = await fetch('http://localhost:3000/api/products', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const prodData = await prodRes.json();
        const products = prodData.data;
        console.log(`Found ${products.length} products`);

        if (products.length === 0) {
            console.log('No products to test on');
            return;
        }

        const product = products[0];
        console.log(`Testing update on product: ${product.name} (ID: ${product.id})`);

        const updateData = {
            name: product.name,
            categoryId: product.categoryId,
            price: Number(product.price),
            cost: Number(product.cost) || 0,
            imageUrl: 'https://i.ibb.co.com/60HhNGbz/bakul.jpg',
        };

        console.log('Sending update payload:', updateData);
        const updateRes = await fetch(`http://localhost:3000/api/products/${product.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        console.log('Update status:', updateRes.status);
        if (!updateRes.ok) {
            console.error('Update text:', await updateRes.text());
        }

        console.log('Testing delete on product: ' + product.id);
        const delRes = await fetch(`http://localhost:3000/api/products/${product.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Delete status!', delRes.status);
        if (!delRes.ok) {
            console.error('Delete text:', await delRes.text());
        }
    } catch (e) {
        console.error('General error:', e.message);
    }
}

test();
