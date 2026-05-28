export type TileStatus =
  | "empty"
  | "tbd"
  | "correct"
  | "present"
  | "absent";

export type GameStatus = "playing" | "won" | "lost";

export type GuessRow = {
  letters: string[];
  statuses: TileStatus[];
};

export type ToastMessage = {
  id: number;
  text: string;
};
