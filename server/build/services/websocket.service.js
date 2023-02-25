"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const tslog_1 = require("tslog");
const users = [];
const getUserBySid = (sid) => {
    return users.find((user) => user.sid === sid);
};
const getUserByUsername = (username) => {
    return users.find((user) => user.username === username);
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
        let userDetails;
        logger.info(`New connection from ${socket.id}`);
        socket.on('chat-register', ({ username }) => {
            if (getUserByUsername(username))
                return false;
            users.forEach((user) => {
                logger.info(user);
                io.to(user.sid).emit('user-joined', { username });
                io.to(socket.id).emit('existing-user', { username: user.username });
            });
            logger.info(`${socket.id} registered as ${username}`);
            userDetails = { username, sid: socket.id };
            users.push(userDetails);
        });
        socket.on('chat-message', ({ recepient, message }) => {
            const receiver = getUserByUsername(recepient);
            const sender = getUserBySid(socket.id);
            if (!receiver)
                return false;
            logger.info(`Received new messge from ${sender.sid}:${userDetails.username} -> ${receiver.sid}:${receiver.username}: '${message}'`);
            io.to(receiver.sid).emit('chat-message', {
                recepient: receiver.username,
                message,
                sender: sender.username,
                has_read: false,
                image: ''
            });
        });
        socket.on('disconnect', () => {
            const sender = getUserBySid(socket.id);
            if (!sender)
                return false;
            logger.info(`${sender.sid}:${sender.username} has disconnected`);
            users.forEach((user, index) => {
                if (user.sid === socket.id)
                    users.splice(index, 1);
                else
                    io.to(user.sid).emit('user-left', { username: sender.username });
            });
        });
    });
    return io;
};
