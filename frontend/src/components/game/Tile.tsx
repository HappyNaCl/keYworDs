import type { TileStatus } from "../../game/types";
import "./Tile.css";

type TileProps = {
  letter: string;
  status: TileStatus;
};

function Tile({ letter, status }: TileProps) {
  return <div className={`tile tile--${status}`}>{letter}</div>;
}

export default Tile;
