import { api } from "./client";

export type ServerLetterScore = "hit" | "present" | "miss";
export type ServerGameStatus = "IN_PROGRESS" | "WON" | "LOST";

export type ServerGuess = {
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

export function startGame() {
  return api<GameState>("/games", { method: "POST" });
}

export function submitGuess(guess: string) {
  return api<GameState>("/games/guesses", {
    method: "POST",
    body: JSON.stringify({ guess }),
  });
}
