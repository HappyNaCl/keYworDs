import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* TODO: Setup the routing for all 3 pages, make sure to wrap it in the UserContext provider! */}
  </StrictMode>,
);
