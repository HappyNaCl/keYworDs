import { ApiProperty } from "@nestjs/swagger";

export class LeaderboardEntity {
  @ApiProperty()
  id!: number;

  @ApiProperty({ example: "Ada" })
  playerName!: string;

  @ApiProperty({ description: "Attempts used in the game", example: 4 })
  attempts!: number;

  @ApiProperty()
  won!: boolean;

  @ApiProperty()
  dayWordId!: number;

  @ApiProperty()
  gameSessionId!: string;

  @ApiProperty()
  createdAt!: Date;
}
