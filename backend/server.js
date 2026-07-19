const express = require('express');
require('dotenv').config();   // loads variables from our .env file
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// Our MongoDB connection string, safely loaded from .env (never hardcoded here)
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;   // will hold our connected database, once ready

// Connects to MongoDB when the server starts
async function connectDB() {
    try {
        await client.connect();
        db = client.db('novacart');   // names our database "novacart"
        console.log('✅ Connected to MongoDB successfully!');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
    }
}

connectDB();

app.get('/', (req, res) => {
    res.send('Novacart backend server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});