import { type SubmitEvent } from "react";
import Logo from "../components/ui/Logo";
import "./LandingPage.css";

function LandingPage() {
  const handleSubmit = (event: SubmitEvent) => {
    /* 
      TODO (No. 2): 
       1. Get the player's name from the input
       2. Validate the player's name is not empty
       3. Save the player's name to UserContext
       4. Redirect to Game Page 
    */
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
          placeholder="e.g. John Doe"
          autoFocus
        />
        {/* TODO (No. 3): Set the button to be disabled when input above is still empty */}
        <button type="submit">PLAY</button>
      </form>
    </main>
  );
}

export default LandingPage;
