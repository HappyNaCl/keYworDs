import { api } from "./client";

export type LeaderboardEntry = {
  id: number;
  playerName: string;
  attempts: number;
  won: boolean;
  createdAt: string;
};

export type LeaderboardSort = "playerName" | "attempts" | "won" | "createdAt";

export function fetchLeaderboard(opts: {
  date?: string;
  limit?: number;
  sort?: LeaderboardSort;
} = {}) {
  const params = new URLSearchParams();
  if (opts.date) params.set("date", opts.date);
  params.set("limit", String(opts.limit ?? 50));
  if (opts.sort) params.set("sort", opts.sort);
  return api<LeaderboardEntry[]>(`/leaderboards?${params.toString()}`);
}

export function submitLeaderboard(playerName: string) {
  return api<LeaderboardEntry>("/leaderboards", {
    method: "POST",
    body: JSON.stringify({ playerName }),
  });
}
