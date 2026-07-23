const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
// Middleware: checks if a valid login token was sent with the request
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Please log in to do this.' });
    }

    const token = authHeader.split(' ')[1];   // "Bearer xxxxx" → just "xxxxx"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;   // attaches the logged-in user's info to this request
        next();   // token is valid — let the request continue to its actual route
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired login. Please log in again.' });
    }
}
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

app.get('/api/products', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Creates a new product — ONLY accessible to logged-in users
app.post('/api/products', requireAuth, async (req, res) => {
    try {
        const { name, price, image, description, category } = req.body;

        const newProduct = {
            name,
            price: Number(price),
            image,
            description,
            category,
            sellerEmail: req.user.email,   // remembers who added this product
            createdAt: new Date()
        };

        const result = await db.collection('products').insertOne(newProduct);
        res.status(201).json({ message: 'Product added successfully!', productId: result.insertedId });

    } catch (error) {
        res.status(500).json({ error: 'Failed to add product.' });
    }
});
// User signup — creates a new account
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if a user with this email already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        // Hash (securely scramble) the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user
        const newUser = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);

        // Create a token for this new user, so they're automatically logged in after signup
        const token = jwt.sign(
            { userId: result.insertedId, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: { name, email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong creating your account.' });
    }
});
// User login — verifies email/password and returns a token
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Compare the entered password against the stored (hashed) password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Passwords match — create a new token for this login session
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: { name: user.name, email: user.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong logging in.' });
    }
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