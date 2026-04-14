const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const socketHandler = require('./sockets/socketHandler');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Support multiple allowed origins (comma-separated in CLIENT_URL)
const rawOrigins = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim());

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, mobile apps) or whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

socketHandler(io);
app.set('io', io);

app.use(helmet());
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // handle preflight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/reels', require('./routes/reelRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/guilds', require('./routes/guildRoutes'));
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
