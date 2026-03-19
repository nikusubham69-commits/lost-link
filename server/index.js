require('dotenv').config();

// Validate essential environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// API Routes
app.get('/', (req, res) => {
    res.send('LOST-LINK API is running...');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*', // In production, consider limiting to client URL
    },
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join personal room based on userId for private notifications
    socket.on('setup', (userData) => {
        if (userData && userData.id) {
            socket.join(userData.id);
            console.log(`👤 User ${userData.id} setup and joined personal room`);
            socket.emit('connected');
        }
    });

    socket.on('join-chat', (chatId) => {
        socket.join(chatId);
        console.log(`💬 Socket ${socket.id} joined chat: ${chatId}`);
    });

    socket.on('new-message', (message) => {
        const chat = message.chat;
        if (!chat || !chat.participants) return console.log('Chat participants not defined');

        chat.participants.forEach((user) => {
            const userId = user._id || user; // handle both object and ID
            if (userId.toString() === message.sender._id.toString()) return;
            
            // Emit to the user's personal room
            socket.in(userId.toString()).emit('message-received', message);
        });
    });

    socket.on('leave-chat', (chatId) => {
        socket.leave(chatId);
        console.log(`🚪 Socket ${socket.id} left chat: ${chatId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});