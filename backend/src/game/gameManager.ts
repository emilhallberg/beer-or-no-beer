// src/gameManager.ts
import { Server, Socket } from 'socket.io';
import { Game, Player, Question, Answer } from '../types';
import prisma from '../db/prisma';

const games: Record<string, Game> = {};
const QUESTION_TIME_LIMIT = 10000; // 10 seconds
const INTERVAL_BETWEEN_QUESTIONS = 3000; // 3 seconds

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createGame(socket: Socket) {
  const pin = generatePin();
  games[pin] = {
    host: socket.id,
    players: [],
    questions: [],
    currentQuestionIndex: 0,
    rounds: 0,
    answers: {},
  };
  socket.join(pin);
  return { pin };
}

export function joinGame(io: Server, socket: Socket, pin: string, nickname: string) {
  const game = games[pin];
  if (!game) return { success: false, error: 'Game not found' };

  const player: Player = { id: socket.id, nickname, score: 0 };
  game.players.push(player);
  socket.join(pin);

  io.to(pin).emit('playerListUpdate', game.players);
  return { success: true };
}

export async function startGame(io: Server, pin: string, rounds: number = 5) {
  const game = games[pin];
  if (!game) return;

  const questions = await prisma.question.findMany({ take: rounds });
  game.questions = questions;
  game.rounds = rounds;
  game.currentQuestionIndex = 0;
  game.answers = {};

  sendNextQuestion(io, pin, game);
}

function sendNextQuestion(io: Server, pin: string, game: Game) {
  const index = game.currentQuestionIndex;
  const question = game.questions[index];
  game.startTime = Date.now();
  game.answers[question.id] = [];

  io.to(pin).emit('newQuestion', {
    question: {
      id: question.id,
      name: question.name,
      description: question.description,
    },
    index: index + 1,
    total: game.rounds,
    timeLimit: QUESTION_TIME_LIMIT,
  });

  setTimeout(() => endQuestion(io, pin, game), QUESTION_TIME_LIMIT);
}

function endQuestion(io: Server, pin: string, game: Game) {
  io.to(pin).emit('questionEnded', {
    index: game.currentQuestionIndex + 1,
    total: game.rounds,
  });

  game.currentQuestionIndex++;

  if (game.currentQuestionIndex < game.rounds) {
    setTimeout(() => sendNextQuestion(io, pin, game), INTERVAL_BETWEEN_QUESTIONS);
  } else {
    io.to(pin).emit('gameEnded', {
      players: game.players,
    });
  }
}

export function submitAnswer(io: Server, socket: Socket, pin: string, questionId: number, isCorrect: boolean) {
  const game = games[pin];
  if (!game || !game.answers) return;

  const now = Date.now();
  const elapsed = now - (game.startTime ?? now);

  if (elapsed > QUESTION_TIME_LIMIT) return; // ignore late answers

  if (!game.answers[questionId]) game.answers[questionId] = [];
  if (game.answers[questionId].some(a => a.playerId === socket.id)) return; // prevent double answer

  game.answers[questionId].push({ playerId: socket.id, correct: isCorrect, time: elapsed });

  const correctAnswers = game.answers[questionId].filter(a => a.correct).sort((a, b) => a.time - b.time);
  const position = correctAnswers.findIndex(a => a.playerId === socket.id);
  const player = game.players.find(p => p.id === socket.id);

  if (player && position !== -1) {
    const points = [100, 75, 50][position] || 25;
    player.score = (player.score || 0) + points;
  }

  io.to(pin).emit('playerListUpdate', game.players);

  // Auto end if all players have answered
  if (game.answers[questionId].length === game.players.length) {
    endQuestion(io, pin, game);
  }
}

export function disconnectPlayer(io: Server, socket: Socket) {
  for (const pin in games) {
    const game = games[pin];
    const index = game.players.findIndex(p => p.id === socket.id);
    if (index !== -1) {
      game.players.splice(index, 1);
      io.to(pin).emit('playerListUpdate', game.players);
    }
  }
} 