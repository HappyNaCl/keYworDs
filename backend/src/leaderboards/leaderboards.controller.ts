import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { LeaderboardsService } from "./leaderboards.service";
import { CreateLeaderboardDto } from "./dto/create-leaderboard.dto";

@Controller("leaderboards")
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateLeaderboardDto) {
    const sessionId = req.cookies?.gameSessionId as string | undefined;
    return this.leaderboardsService.create(sessionId, dto.playerName);
  }

  @Get()
  findAll() {
    // TODO: Make an endpoint to get all leaderboards by date.
    return this.leaderboardsService.findByDate();
  }
}
