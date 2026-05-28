import { api } from "./client";

export type ServerLetterScore = "hit" | "present" | "miss";
export type ServerGameStatus = "IN_PROGRESS" | "WON" | "LOST";
type ServerGuess = {
  guess: string;
  pattern: ServerLetterScore[];
};

export type GameState = {
  id: string;
  attemptsUsed: number;
  maxAttempts: number;
  wordLength: number;
  status: ServerGameStatus;
  guesses: ServerGuess[];
  answer?: string;
};

export function startGame(): Promise<GameState> {
  // TODO: POST /games endpoint with an empty body and return the response
}

export function submitGuess(guess: string): Promise<GameState> {
  // TODO: POST /games/guesses endpoint with the guess and return the response
}
