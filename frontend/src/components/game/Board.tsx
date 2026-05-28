import Row from "./Row";
import type { GuessRow } from "../../game/types";
import "./Board.css";

type BoardProps = {
  rows: GuessRow[];
};

function Board({ rows }: BoardProps) {
  return (
    <div className="board">
      {rows.map((row, index) => (
        <Row key={index} letters={row.letters} statuses={row.statuses} />
      ))}
    </div>
  );
}

export default Board;
