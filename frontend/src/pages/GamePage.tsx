import { useUser } from "../context/useUser";
import { useWordleGame } from "../game/useWordleGame";
import Board from "../components/game/Board";
import Keyboard from "../components/game/Keyboard";
import Toast from "../components/ui/Toast";
import "./GamePage.css";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router";
import { submitLeaderboard } from "../api/leaderboards";

function GamePage() {
  const {
    rows,
    status,
    target,
    keyStatuses,
    toast,
    guessCount,
    addLetter,
    removeLetter,
    submit,
  } = useWordleGame();

  const { name } = useUser();
  const submittedRef = useRef(false);
  const [submitState, setSubmitState] = useState<
    "submitting" | "done" | "error"
  >("submitting");

  useEffect(() => {
    if (status === "playing" || submittedRef.current || !name) return;
    submittedRef.current = true;

    (async () => {
      try {
        await submitLeaderboard(name);
        setSubmitState("done");
      } catch {
        setSubmitState("error");
      }
    })();
  }, [status, name]);

  /*
    TODO: Validate that the user has already entered their name,
    If they haven't entered their name, redirect to the Landing Page
   */

  const isOver = status !== "playing";

  return (
    <main className="game-page">
      {toast && <Toast key={toast.id} message={toast.text} />}

      <Board rows={rows} />

      {isOver && (
        <div className="game-page__status">
          <p className="game-page__status-message">
            {status === "won"
              ? `You got it in ${guessCount} ${guessCount <= 1 ? "guess" : "guesses"}!`
              : `The word was ${target.toUpperCase()}`}
          </p>
          {submitState === "submitting" && <p>Saving your score…</p>}
          {submitState === "error" && <p>Could not save score.</p>}
          <Link to="/leaderboard" className="game-page__reset">
            View leaderboard
          </Link>
        </div>
      )}

      <Keyboard
        keyStatuses={keyStatuses}
        onLetter={addLetter}
        onEnter={submit}
        onBackspace={removeLetter}
      />
    </main>
  );
}

export default GamePage;
