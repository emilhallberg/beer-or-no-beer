// src/socket.ts
import { Server, Socket } from 'socket.io';
import {
  createGame,
  joinGame,
  startGame,
  disconnectPlayer,
  submitAnswer,
} from './gameManager';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createGame', async (data, callback) => {
      const result = await createGame(socket);
      callback(result);
    });

    socket.on('joinGame', ({ pin, nickname }, callback) => {
      const result = joinGame(io, socket, pin, nickname);
      callback(result);
    });

    // Accept 'rounds' from client when starting game
    socket.on('startGame', ({ pin, rounds }) => {
      startGame(io, pin, rounds);
    });

    // Accept submitted answer from client
    socket.on('submitAnswer', ({ pin, questionId, isCorrect }) => {
      submitAnswer(io, socket, pin, questionId, isCorrect);
    });

    socket.on('disconnect', () => {
      disconnectPlayer(io, socket);
      console.log('Client disconnected:', socket.id);
    });
  });
}
