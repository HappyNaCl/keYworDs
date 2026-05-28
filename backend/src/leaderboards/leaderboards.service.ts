import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { GameStatus, Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const SORTABLE: Record<string, keyof Prisma.LeaderboardOrderByWithRelationInput> = {
  playerName: "playerName",
  attempts: "attempts",
  won: "won",
  createdAt: "createdAt",
};
export type LeaderboardSortKey = keyof typeof SORTABLE;
export type SortDir = "asc" | "desc";

@Injectable()
export class LeaderboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(sessionId: string | undefined, playerName: string) {
    if (!sessionId) {
      throw new UnauthorizedException("No active game session");
    }
    const name = playerName?.trim();
    if (!name) {
      throw new BadRequestException("playerName is required");
    }

    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { leaderboard: true },
    });
    if (!session) {
      throw new NotFoundException("Game session not found");
    }
    if (session.status === GameStatus.IN_PROGRESS) {
      throw new BadRequestException("Finish the game first");
    }
    if (session.leaderboard) {
      throw new ConflictException(
        "Leaderboard entry already submitted for this game",
      );
    }

    return this.prisma.leaderboard.create({
      data: {
        playerName: name,
        attempts: session.attemptsUsed,
        won: session.status === GameStatus.WON,
        dayWordId: session.dayWordId,
        gameSessionId: session.id,
      },
    });
  }

  async findByDate(
    date?: string,
    limit = 50,
    sort?: string,
    dir?: string,
  ) {
    const target = date ? new Date(date) : new Date();
    if (Number.isNaN(target.getTime())) {
      throw new BadRequestException("date must be a valid YYYY-MM-DD string");
    }
    target.setHours(0, 0, 0, 0);

    const sortKey = sort && sort in SORTABLE ? SORTABLE[sort] : "attempts";
    const sortDir: SortDir = dir === "desc" ? "desc" : "asc";

    const dayWord = await this.prisma.dayWord.findUnique({
      where: { date: target },
    });
    if (!dayWord) {
      return [];
    }

    return this.prisma.leaderboard.findMany({
      where: { dayWordId: dayWord.id },
      orderBy: [{ [sortKey]: sortDir }, { createdAt: "asc" }],
      take: limit,
    });
  }
}
