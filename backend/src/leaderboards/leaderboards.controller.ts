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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { Request } from "express";
import { LeaderboardsService } from "./leaderboards.service";
import { CreateLeaderboardDto } from "./dto/create-leaderboard.dto";
import { LeaderboardEntity } from "./entities/leaderboard.entity";

@ApiTags("leaderboards")
@Controller("leaderboards")
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Post()
  @ApiCookieAuth("gameSessionId")
  @ApiOperation({
    summary: "Submit the finished game to today's leaderboard",
  })
  @ApiCreatedResponse({ type: LeaderboardEntity })
  @ApiBadRequestResponse({
    description: "playerName is missing, or the game is still in progress",
  })
  @ApiUnauthorizedResponse({ description: "No active game session" })
  @ApiNotFoundResponse({ description: "Game session not found" })
  @ApiConflictResponse({ description: "Entry already submitted for this game" })
  create(@Req() req: Request, @Body() dto: CreateLeaderboardDto) {
    const sessionId = req.cookies?.gameSessionId as string | undefined;
    return this.leaderboardsService.create(sessionId, dto.playerName);
  }

  @Get()
  @ApiOperation({
    summary: "List leaderboard entries for a given day",
    description: "Returns an empty list when there is no puzzle for that date.",
  })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Day to read, YYYY-MM-DD. Defaults to today.",
    example: "2026-07-29",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Maximum entries to return. Defaults to 50.",
  })
  @ApiQuery({
    name: "sort",
    required: false,
    enum: ["playerName", "attempts", "won", "createdAt"],
    description: "Primary sort key, ascending. Defaults to attempts.",
  })
  @ApiOkResponse({ type: [LeaderboardEntity] })
  @ApiBadRequestResponse({ description: "date is not a valid YYYY-MM-DD" })
  findAll(
    @Query("date") date: string | undefined,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query("sort") sort: string | undefined,
  ) {
    return this.leaderboardsService.findByDate(date, limit, sort);
  }
}
