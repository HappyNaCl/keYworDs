import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import type { CookieOptions, Request, Response } from "express";
import { GamesService } from "./games.service";
import { SubmitGuessDto } from "./dto/submit-guess.dto";

const COOKIE_NAME = "gameSessionId";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

@Controller("games")
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Post()
  async start(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.[COOKIE_NAME] as string | undefined;
    const result = await this.games.startOrResume(sessionId);
    if (result.id !== sessionId) {
      res.cookie(COOKIE_NAME, result.id, cookieOptions);
    }
    return result;
  }

  @Post("guesses")
  async guess(@Req() req: Request, @Body() dto: SubmitGuessDto) {
    const sessionId = req.cookies?.[COOKIE_NAME] as string | undefined;
    return this.games.submitGuess(sessionId, dto.guess);
  }
}
