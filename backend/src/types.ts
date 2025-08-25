export interface Player {
  id: string;
  nickname: string;
  score?: number;
}

export interface Question {
  id: number;
  name: string;
  description: string;
  real: boolean;
}

export interface Answer {
  playerId: string;
  correct: boolean;
  time: number;
}

export interface Game {
  host: string;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  rounds: number;
  answers: Record<number, Answer[]>;
  startTime?: number;
}
