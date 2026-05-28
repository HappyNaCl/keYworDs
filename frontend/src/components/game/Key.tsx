import type { MouseEvent } from "react";
import type { TileStatus } from "../../game/types";

type KeyProps = {
  label: string;
  value: string;
  status?: TileStatus;
  wide?: boolean;
  onPress: (value: string) => void;
};

function Key({ label, value, status, wide, onPress }: KeyProps) {
  const classes = ["key"];
  if (status && status !== "empty" && status !== "tbd") {
    classes.push(`key--${status}`);
  }
  if (wide) classes.push("key--wide");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    onPress(value);
  };

  return (
    <button
      type="button"
      className={classes.join(" ")}
      onClick={handleClick}
      tabIndex={-1}
    >
      {label}
    </button>
  );
}

export default Key;
