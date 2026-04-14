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
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

socketHandler(io);
app.set('io', io);

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
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
