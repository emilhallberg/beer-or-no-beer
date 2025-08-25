import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // restrict this in prod
    },
});
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('createGame', (data, callback) => {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Game created:', pin);
        callback({ pin });
    });
    socket.on('joinGame', ({ pin, nickname }, callback) => {
        console.log(`${nickname} joined game ${pin}`);
        io.emit('playerListUpdate', [{ nickname }]);
        callback({ success: true });
    });
    socket.on('startGame', (pin) => {
        console.log(`Game ${pin} started`);
        io.emit('gameStarted');
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
