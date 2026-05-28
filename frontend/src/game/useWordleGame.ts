import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "../api/client";
import {
  startGame,
  submitGuess,
  type GameState,
  type ServerLetterScore,
} from "../api/games";
import type { GameStatus, GuessRow, TileStatus, ToastMessage } from "./types";

const TOAST_DURATION_MS = 1800;

const STATUS_RANK: Record<TileStatus, number> = {
  empty: 0,
  tbd: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

const TILE_FROM_SERVER: Record<ServerLetterScore, TileStatus> = {
  hit: "correct",
  present: "present",
  miss: "absent",
};

const STATUS_FROM_SERVER: Record<GameState["status"], GameStatus> = {
  IN_PROGRESS: "playing",
  WON: "won",
  LOST: "lost",
};

export function useWordleGame() {
  const [game, setGame] = useState<GameState | null>(null);
  const [current, setCurrent] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastIdRef = useRef(0);

  const showToast = useCallback((text: string) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    startGame()
      .then((state) => {
        if (!cancelled) setGame(state);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        showToast(
          err instanceof ApiError ? err.message : "Could not start the game",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const status: GameStatus = game ? STATUS_FROM_SERVER[game.status] : "playing";
  const wordLength = game?.wordLength ?? 5;
  const maxGuesses = game?.maxAttempts ?? 6;

  const addLetter = useCallback(
    (letter: string) => {
      if (!game || status !== "playing" || isValidating) return;
      setCurrent((c) => (c.length >= wordLength ? c : c + letter.toLowerCase()));
    },
    [game, status, isValidating, wordLength],
  );

  const removeLetter = useCallback(() => {
    if (!game || status !== "playing" || isValidating) return;
    setCurrent((c) => c.slice(0, -1));
  }, [game, status, isValidating]);

  const submit = useCallback(async () => {
    if (!game || status !== "playing" || isValidating) return;
    if (current.length !== wordLength) {
      showToast(`Not enough letters`);
      return;
    }

    setIsValidating(true);
    try {
      const next = await submitGuess(current);
      setGame(next);
      setCurrent("");
    } catch (err: unknown) {
      showToast(err instanceof ApiError ? err.message : "Could not submit guess");
    } finally {
      setIsValidating(false);
    }
  }, [current, game, status, isValidating, wordLength, showToast]);

  const reset = useCallback(() => {
    setCurrent("");
    setIsValidating(false);
    setToast(null);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Enter") submit();
      else if (event.key === "Backspace") removeLetter();
      else if (/^[a-zA-Z]$/.test(event.key)) addLetter(event.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submit, removeLetter, addLetter]);

  const rows = useMemo<GuessRow[]>(() => {
    const built: GuessRow[] = [];

    if (game) {
      for (const g of game.guesses) {
        built.push({
          letters: g.guess.split(""),
          statuses: g.pattern.map((p) => TILE_FROM_SERVER[p]),
        });
      }
    }

    if (status === "playing") {
      const letters = current.split("");
      const pad = wordLength - letters.length;
      built.push({
        letters: [...letters, ...Array<string>(pad).fill("")],
        statuses: [
          ...letters.map<TileStatus>(() => "tbd"),
          ...Array<TileStatus>(pad).fill("empty"),
        ],
      });
    }

    while (built.length < maxGuesses) {
      built.push({
        letters: Array<string>(wordLength).fill(""),
        statuses: Array<TileStatus>(wordLength).fill("empty"),
      });
    }

    return built;
  }, [game, current, status, wordLength, maxGuesses]);

  const keyStatuses = useMemo<Record<string, TileStatus>>(() => {
    const map: Record<string, TileStatus> = {};
    if (!game) return map;
    for (const g of game.guesses) {
      for (let i = 0; i < g.guess.length; i++) {
        const letter = g.guess[i].toLowerCase();
        const next = TILE_FROM_SERVER[g.pattern[i]];
        if (STATUS_RANK[next] > (STATUS_RANK[map[letter]] ?? 0)) {
          map[letter] = next;
        }
      }
    }
    return map;
  }, [game]);

  return {
    rows,
    status,
    target: game?.answer ?? "",
    keyStatuses,
    toast,
    isValidating,
    guessCount: game?.attemptsUsed ?? 0,
    addLetter,
    removeLetter,
    submit,
    reset,
  };
}
