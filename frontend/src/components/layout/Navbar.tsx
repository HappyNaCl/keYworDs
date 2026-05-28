import { useNavigate } from "react-router";
import Logo from "../ui/Logo";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar__brand"
        onClick={() => navigate("/")}
        aria-label="Home"
      >
        <Logo size="sm" />
      </button>
      <div className="navbar__actions">
        <button
          type="button"
          className="navbar__button"
          onClick={() => navigate("/leaderboard")}
        >
          Leaderboard
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
