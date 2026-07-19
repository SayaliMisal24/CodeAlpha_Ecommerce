const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('novacart');
        console.log('✅ Connected to MongoDB successfully!');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
    }
}

connectDB();

app.get('/', (req, res) => {
    res.send('Novacart backend server is running!');
});

// Fetches ALL products from the database
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});