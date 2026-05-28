import Tile from "./Tile";
import type { TileStatus } from "../../game/types";

type RowProps = {
  letters: string[];
  statuses: TileStatus[];
};

function Row({ letters, statuses }: RowProps) {
  return (
    <div className="board-row">
      {letters.map((letter, index) => (
        <Tile key={index} letter={letter} status={statuses[index]} />
      ))}
    </div>
  );
}

export default Row;
