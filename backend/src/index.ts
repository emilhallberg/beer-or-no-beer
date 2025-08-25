import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './game/socket';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://beerornobeer.com']
      : '*',
  },
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
