import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { CookieOptions, Request, Response } from "express";
import { GamesService } from "./games.service";
import { SubmitGuessDto } from "./dto/submit-guess.dto";
import { GameSessionEntity } from "./entities/game-session.entity";

const COOKIE_NAME = "gameSessionId";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

@ApiTags("games")
@Controller("games")
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Post()
  @ApiOperation({
    summary: "Start or resume today's game",
    description:
      "Resumes the game bound to the `gameSessionId` cookie when it belongs to today's puzzle, otherwise creates a new session and sets the cookie.",
  })
  @ApiCreatedResponse({ type: GameSessionEntity })
  @ApiNotFoundResponse({ description: "No puzzle for today yet" })
  async start(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.[COOKIE_NAME] as string | undefined;
    const result = await this.games.startOrResume(sessionId);
    if (result.id !== sessionId) {
      res.cookie(COOKIE_NAME, result.id, cookieOptions);
    }
    return result;
  }

  @Post("guesses")
  @ApiCookieAuth("gameSessionId")
  @ApiOperation({
    summary: "Submit a guess for the active session",
    description:
      "Scores the guess and returns the updated session. The answer is revealed once the game is won or lost.",
  })
  @ApiOkResponse({ type: GameSessionEntity })
  @ApiBadRequestResponse({
    description: "Wrong length, not in word list, or game already finished",
  })
  @ApiUnauthorizedResponse({ description: "No active game session" })
  @ApiNotFoundResponse({ description: "Game session not found" })
  async guess(@Req() req: Request, @Body() dto: SubmitGuessDto) {
    const sessionId = req.cookies?.[COOKIE_NAME] as string | undefined;
    return this.games.submitGuess(sessionId, dto.guess);
  }
}
