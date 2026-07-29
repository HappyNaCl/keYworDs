import { ApiProperty } from "@nestjs/swagger";

export class SubmitGuessDto {
  @ApiProperty({
    description: "The guessed word, must match today's word length",
    example: "crane",
  })
  guess!: string;
}
