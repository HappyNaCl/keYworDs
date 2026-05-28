import { useState, type SubmitEvent } from "react";
import { useUser } from "../context/useUser";
import Logo from "../components/ui/Logo";
import "./LandingPage.css";

function LandingPage() {
  const { name, setName } = useUser();
  const [draft, setDraft] = useState(name);

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setName(trimmed);

    // TODO: Redirect to Game Page
  };

  return (
    <main className="name-input">
      <Logo size="lg" />
      <p className="tagline">
        Six tries <span aria-hidden="true">·</span> Five letters{" "}
        <span aria-hidden="true">·</span> One word
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="player-name">Your name</label>
        <input
          id="player-name"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. John Doe"
          autoFocus
        />
        <button type="submit" disabled={!draft.trim()}>
          PLAY
        </button>
      </form>
    </main>
  );
}

export default LandingPage;
