export const GAME_SCORE_EVENT = "game-score-change" as const;
export const GAME_ANSWER_EVENT = "game-answer" as const;
export type AnswerFeedback = {
  correct: boolean;
  name: string;
  real: boolean;
  points: number;
  streak: number;
};
