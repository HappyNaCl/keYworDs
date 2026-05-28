import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  type LeaderboardDir,
  type LeaderboardEntry,
  type LeaderboardSort,
} from "../api/leaderboards";
import { ApiError } from "../api/client";
import "./LeaderboardPage.css";

const COLUMNS: {
  key: LeaderboardSort;
  label: string;
  align?: "right" | "center";
}[] = [
  { key: "playerName", label: "Player" },
  { key: "attempts", label: "Attempts", align: "right" },
  { key: "won", label: "Result", align: "center" },
  { key: "createdAt", label: "Submitted", align: "right" },
];

function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<LeaderboardSort>("attempts");
  const [sortDir, setSortDir] = useState<LeaderboardDir>("asc");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchLeaderboard({ sort: sortKey, dir: sortDir })
      .then((rows) => {
        if (!cancelled) setEntries(rows);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Could not load leaderboard",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sortKey, sortDir]);

  const handleSort = (key: LeaderboardSort) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const indicator = (key: LeaderboardSort) =>
    key !== sortKey ? "" : sortDir === "asc" ? " ▲" : " ▼";

  return (
    <main className="leaderboard-page">
      <h1 className="leaderboard-page__title">Leaderboard</h1>

      {error && <p className="leaderboard-page__placeholder">{error}</p>}

      {!error && entries === null && (
        <p className="leaderboard-page__placeholder">Loading…</p>
      )}

      {!error && entries && entries.length === 0 && (
        <p className="leaderboard-page__placeholder">
          No entries for today yet. Be the first!
        </p>
      )}

      {!error && entries && entries.length > 0 && (
        <table
          className="leaderboard-page__table"
          aria-busy={loading || undefined}
        >
          <thead>
            <tr>
              <th className="leaderboard-page__rank">#</th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={`leaderboard-page__th leaderboard-page__th--${c.align ?? "left"}`}
                  aria-sort={
                    sortKey === c.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    className="leaderboard-page__sort-btn"
                    onClick={() => handleSort(c.key)}
                    disabled={loading}
                  >
                    {c.label}
                    {indicator(c.key)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id}>
                <td className="leaderboard-page__rank">{i + 1}</td>
                <td>{e.playerName}</td>
                <td className="leaderboard-page__cell--right">{e.attempts}</td>
                <td className="leaderboard-page__cell--center">
                  {e.won ? "Won" : "Lost"}
                </td>
                <td className="leaderboard-page__cell--right">
                  {new Date(e.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default LeaderboardPage;
