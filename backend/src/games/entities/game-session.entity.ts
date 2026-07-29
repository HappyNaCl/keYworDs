import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { GameStatus } from "../../generated/prisma/client";
import { LetterScore } from "../score";

export class GuessRecordEntity {
  @ApiProperty({ example: "crane" })
  guess!: string;

  @ApiProperty({
    description: "Per-letter result, positionally aligned with the guess",
    enum: ["hit", "present", "miss"],
    isArray: true,
    example: ["miss", "present", "hit", "miss", "miss"],
  })
  pattern!: LetterScore[];
}

export class GameSessionEntity {
  @ApiProperty({ description: "Game session id, also stored as a cookie" })
  id!: string;

  @ApiProperty({ example: 2 })
  attemptsUsed!: number;

  @ApiProperty({ example: 6 })
  maxAttempts!: number;

  @ApiProperty({ example: 5 })
  wordLength!: number;

  @ApiProperty({ enum: GameStatus, enumName: "GameStatus" })
  status!: GameStatus;

  @ApiProperty({ type: [GuessRecordEntity] })
  guesses!: GuessRecordEntity[];

  @ApiPropertyOptional({
    description: "Only revealed once the game is won or lost",
    example: "trace",
  })
  answer?: string;
}
