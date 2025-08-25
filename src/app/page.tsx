'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

type Question = {
  id: number;
  name: string;
  description: string;
};

export default function HomePage() {
  const [connected, setConnected] = useState(false);
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [gamePin, setGamePin] = useState('');
  const [rounds, setRounds] = useState(5);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('playerListUpdate', (players) => {
      setPlayers(players);
    });

    socket.on('newQuestion', ({ question, index, total }) => {
      setCurrentQuestion(question);
      setQuestionIndex(index);
      setTotalRounds(total);
    });

    socket.on('questionEnded', () => {
      setCurrentQuestion(null);
    });

    socket.on('gameEnded', ({ players }) => {
      setPlayers(players);
      setGameOver(true);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('playerListUpdate');
      socket.off('newQuestion');
      socket.off('questionEnded');
      socket.off('gameEnded');
    };
  }, []);

  const handleCreateGame = () => {
    socket.emit('createGame', {}, (response: { pin: string }) => {
      setGamePin(response.pin);
      alert(`Game created with PIN: ${response.pin}`);
    });
  };

  const handleJoinGame = () => {
    socket.emit('joinGame', { pin, nickname }, (response: { success: boolean; error?: string }) => {
      if (response.success) alert('Joined game!');
      else alert(`Error: ${response.error}`);
    });
  };

  const handleStartGame = () => {
    const activePin = gamePin || pin;
    socket.emit('startGame', { pin: activePin, rounds });
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentQuestion) return;
    socket.emit('submitAnswer', {
      pin: gamePin || pin,
      questionId: currentQuestion.id,
      isCorrect,
    });
    setCurrentQuestion(null); // lock UI
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Beer or No Beer</h1>
      <p>Socket connected: {connected ? '✅ Yes' : '❌ No'}</p>

      {!currentQuestion && !gameOver && (
        <>
          <div style={{ margin: '1rem 0' }}>
            <button onClick={handleCreateGame}>Create Game</button>
          </div>

          <div style={{ margin: '1rem 0' }}>
            <input
              type="text"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button onClick={handleJoinGame}>Join Game</button>
          </div>

          <div style={{ margin: '1rem 0' }}>
            <input
              type="number"
              value={rounds}
              min={1}
              max={20}
              onChange={(e) => setRounds(parseInt(e.target.value, 10))}
              placeholder="Number of Rounds"
            />
            <button onClick={handleStartGame}>Start Game</button>
          </div>
        </>
      )}

      {currentQuestion && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Question {questionIndex} of {totalRounds}</h2>
          <h3>{currentQuestion.name}</h3>
          <p>{currentQuestion.description}</p>
          <button onClick={() => handleAnswer(true)}>🍺 Real</button>
          <button onClick={() => handleAnswer(false)}>🚫 Fake</button>
        </div>
      )}

      {gameOver && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Game Over!</h2>
          <h3>Scores:</h3>
          <ul>
            {players.map((p, i) => (
              <li key={i}>
                {p.nickname}: {p.score ?? 0} pts
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3>Players:</h3>
        <ul>
          {players.map((p, idx) => (
            <li key={idx}>{p.nickname} ({p.score ?? 0} pts)</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
