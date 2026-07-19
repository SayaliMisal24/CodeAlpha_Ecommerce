// Import the Express library we just installed
const express = require('express');

// Create our "app" — this represents our entire web server
const app = express();

// Choose which "door" (port) our server listens on
const PORT = 3000;

// A simple test route: when someone visits the homepage of our server,
// send back this message
app.get('/', (req, res) => {
    res.send('Novacart backend server is running!');
});

// Start the server, listening on our chosen port
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});