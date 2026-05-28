import "./Logo.css";

type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  size?: LogoSize;
};

type Tile = {
  letter: string;
  variant: "default" | "yellow" | "green";
};

const TILES: Tile[] = [
  { letter: "k", variant: "default" },
  { letter: "e", variant: "default" },
  { letter: "Y", variant: "yellow" },
  { letter: "w", variant: "default" },
  { letter: "o", variant: "default" },
  { letter: "r", variant: "default" },
  { letter: "D", variant: "green" },
  { letter: "s", variant: "default" },
];

function Logo({ size = "md" }: LogoProps) {
  return (
    <div
      className={`logo logo--${size}`}
      role="img"
      aria-label="keYworDs"
    >
      {TILES.map((tile, index) => (
        <span
          key={index}
          className={
            tile.variant === "default"
              ? "logo-tile"
              : `logo-tile logo-tile--${tile.variant}`
          }
          aria-hidden="true"
        >
          {tile.letter}
        </span>
      ))}
    </div>
  );
}

export default Logo;
