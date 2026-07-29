import { ApiProperty } from "@nestjs/swagger";

export class CreateLeaderboardDto {
  @ApiProperty({
    description: "Display name shown on the leaderboard",
    example: "Ada",
  })
  playerName!: string;
}
