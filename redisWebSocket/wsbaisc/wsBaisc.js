// server.js
const express = require('express');       // Import Express.js for creating the web server and handling routes.
const http = require('http');             // Import Node's built-in HTTP module to create the underlying server.
const { Server } = require('socket.io');  // Import Socket.IO server class for WebSocket handling.

const app = express();                    // Create an Express app instance (handles HTTP requests).
const server = http.createServer(app);    // Wrap Express in an HTTP server (required for Socket.IO to attach).
const io = new Server(server);            // Initialize Socket.IO and attach it to the HTTP server.
const PORT = 3000;                        // Define the port for the server.

// Serve a test HTML file (assumes index.html exists in the project root).
app.get('/', (req, res) => {              // Define a route: When client visits root URL, serve the HTML file.
  res.sendFile(__dirname + '/index.html'); // __dirname is the current script's directory.
});

// Handle WebSocket connections (this is the real-time magic).
io.on('connection', (socket) => {         // Listen for new client connections. 'socket' represents one client.
  console.log('A user connected');        // Log connection event.

  // Listen for messages from client
  socket.on('chat message', (msg) => {    // Event listener: When client emits 'chat message' with data 'msg'.
    console.log('Message received:', msg); // Log the incoming message.

    // Broadcast the message to all connected clients
    io.emit('chat message', msg);         // Re-emit to everyone (including sender). Use socket.emit() for sender-only.
  });

  // Detect disconnection
  socket.on('disconnect', () => {         // Built-in event for when client closes connection.
    console.log('A user disconnected');   // Log the event.
  });
});

// Start the server
server.listen(PORT, () => {               // Start listening on port 3000.
  console.log(`Server running on http://localhost:${PORT}`);
});