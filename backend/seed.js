require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const products = [
    {
        id: 1,
        name: "Classic Leather Watch",
        price: 7499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        description: "A timeless leather-strap watch designed for everyday elegance. Featuring a minimalist dial, durable stainless steel case, and a genuine leather band that ages beautifully over time.",
        category: "Accessories"
    },
    {
        id: 2,
        name: "Urban Sneakers",
        price: 5299,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        description: "Lightweight, comfortable sneakers built for everyday city life. A versatile design that pairs effortlessly with casual or athletic outfits.",
        category: "Footwear"
    },
    {
        id: 3,
        name: "Minimalist Handbag",
        price: 9999,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        description: "A clean, structured handbag crafted from premium vegan leather. Spacious enough for daily essentials while keeping a sleek, minimal silhouette.",
        category: "Accessories"
    },
    {
        id: 4,
        name: "Aviator Sunglasses",
        price: 3749,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
        description: "Classic aviator-style sunglasses with UV-protected lenses and a lightweight metal frame. A timeless accessory for any season.",
        category: "Accessories"
    }
];

async function seedDatabase() {
    try {
        await client.connect();
        const db = client.db('novacart');
        const productsCollection = db.collection('products');

        // Clear out any existing products first, so we don't create duplicates
        await productsCollection.deleteMany({});

        // Insert all our products
        const result = await productsCollection.insertMany(products);
        console.log(`✅ ${result.insertedCount} products inserted successfully!`);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await client.close();   // closes the connection once we're done
    }
}

seedDatabase();