import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import LandingPage from "./pages/LandingPage";
import GamePage from "./pages/GamePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import Layout from "./components/layout/Layout";
import UserProvider from "./context/UserProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* TODO: Setup the routing for all 3 pages, make sure to wrap it in the UserContext provider! */}
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index path="/" element={<LandingPage />}></Route>
            <Route path="/game" element={<GamePage />}></Route>
            <Route path="/leaderboard" element={<LeaderboardPage />}></Route>
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);
