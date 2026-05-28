import Key from "./Key";
import type { TileStatus } from "../../game/types";
import "./Keyboard.css";

type KeyboardProps = {
  keyStatuses: Record<string, TileStatus>;
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
};

const ROWS: string[][] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

function Keyboard({ keyStatuses, onLetter, onEnter, onBackspace }: KeyboardProps) {
  const handlePress = (value: string) => {
    if (value === "enter") {
      onEnter();
      return;
    }
    if (value === "backspace") {
      onBackspace();
      return;
    }
    onLetter(value);
  };

  return (
    <div className="keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            if (key === "enter") {
              return (
                <Key
                  key={key}
                  label="Enter"
                  value="enter"
                  wide
                  onPress={handlePress}
                />
              );
            }
            if (key === "backspace") {
              return (
                <Key
                  key={key}
                  label="⌫"
                  value="backspace"
                  wide
                  onPress={handlePress}
                />
              );
            }
            return (
              <Key
                key={key}
                label={key}
                value={key}
                status={keyStatuses[key]}
                onPress={handlePress}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
