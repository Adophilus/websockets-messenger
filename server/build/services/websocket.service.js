"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const tslog_1 = require("tslog");
const users = {};
const getUsernameBySid = (sid) => {
    for (const [k, v] of Object.entries(users)) {
        if (v === sid)
            return k;
    }
};
exports.default = (server) => {
    const io = new socket_io_1.Server(server, {
        path: '/chat',
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });
    const logger = new tslog_1.Logger();
    io.on('connection', (socket) => {
        let userDetails = {
            username: ''
        };
        logger.info(`New connection from ${socket.id}`);
        socket.on('chat-register', ({ username }) => {
            if (users.username != null)
                return false;
            const chain = io;
            Object.values(users).forEach((sid) => chain.to(sid));
            chain.emit('user-joined', { username });
            logger.info(`${socket.id} registered as ${username}`);
            users[username] = socket.id;
            userDetails.username = username;
        });
        socket.on('chat-message', ({ recepient, message }) => {
            logger.info(`Received new messge from ${socket.id}:${userDetails.username} -> ${recepient}: '${message}'`);
            if (!users[recepient])
                return false;
            const chain = io;
            Object.values(users).forEach((sid) => socket.id !== sid ? chain.to(sid) : null);
            chain.emit('user-joined', { recepient, message, sender: getUsernameBySid(socket.id), has_read: false, image: '' });
        });
        socket.on('disconnect', () => {
            logger.info(`${socket.id} has disconnected`);
            Object.entries(users).forEach(([k, v]) => {
                if (v === socket.id)
                    delete users[k];
            });
        });
    });
    return io;
};
