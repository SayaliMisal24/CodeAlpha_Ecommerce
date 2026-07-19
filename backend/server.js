const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());   // allows our server to understand JSON data sent from the frontend
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
// Saves a new order into the database
app.post('/api/orders', async (req, res) => {
    try {
        const order = {
            ...req.body,           // everything the frontend sent (items, shipping info, total)
            createdAt: new Date()  // stamps the order with the current date/time
        };

        const result = await db.collection('orders').insertOne(order);
        res.status(201).json({ message: 'Order placed successfully!', orderId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});