import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from "@nestjs/common";
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
  findAll(
    @Query("date") date: string | undefined,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query("sort") sort: string | undefined,
  ) {
    return this.leaderboardsService.findByDate(date, limit, sort);
  }
}
