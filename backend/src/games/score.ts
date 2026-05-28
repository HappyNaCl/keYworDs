export type LetterScore = "hit" | "present" | "miss";

export function scoreGuess(guess: string, answer: string): LetterScore[] {
  const result: LetterScore[] = Array(guess.length).fill("miss");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "hit";
    } else {
      remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "hit") continue;
    const c = guess[i];
    if ((remaining[c] ?? 0) > 0) {
      result[i] = "present";
      remaining[c]--;
    }
  }

  return result;
}
