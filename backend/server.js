/**
 * PaySecure Server Entry Point
 * 
 * This file:
 * 1. Loads environment variables
 * 2. Connects to MongoDB
 * 3. Creates HTTP server with Express app
 * 4. Sets up Socket.io for real-time updates
 * 5. Starts listening on the configured port
 */
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// --- Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Make Socket.io accessible in controllers via req.app.get('io')
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Optional: Join a room based on user role/id
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`📢 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// --- Start Server ---
const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  server.listen(PORT, () => {
    console.log(`\n🚀 PaySecure server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/health`);
    console.log(`📑 Swagger Docs: http://localhost:${PORT}/api-docs`);
    console.log(`🔌 Socket.io ready`);
    console.log(`🌐 Frontend expected at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
  });
};

startServer();
