import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { LeaderboardsService } from "./leaderboards.service";
import { PrismaService } from "../prisma/prisma.service";
import { GameStatus } from "../generated/prisma/client";

const mockPrisma = {
  gameSession: { findUnique: jest.fn() },
  dayWord: { findUnique: jest.fn() },
  leaderboard: { create: jest.fn(), findMany: jest.fn() },
};

describe("LeaderboardsService", () => {
  let service: LeaderboardsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LeaderboardsService>(LeaderboardsService);
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe("create", () => {
    describe("session validation", () => {
      it("throws UnauthorizedException when sessionId is undefined", async () => {
        await expect(service.create(undefined, "Alice")).rejects.toThrow(
          UnauthorizedException,
        );
        expect(mockPrisma.gameSession.findUnique).not.toHaveBeenCalled();
      });
    });

    describe("playerName validation", () => {
      it("throws BadRequestException when playerName is an empty string", async () => {
        await expect(service.create("session-1", "")).rejects.toThrow(
          BadRequestException,
        );
      });

      it("throws BadRequestException when playerName is whitespace only", async () => {
        await expect(service.create("session-1", "   ")).rejects.toThrow(
          BadRequestException,
        );
      });

      it("trims whitespace from playerName before saving", async () => {
        mockPrisma.gameSession.findUnique.mockResolvedValue({
          id: "session-1",
          status: GameStatus.WON,
          leaderboard: null,
          attemptsUsed: 2,
          dayWordId: 1,
        });
        mockPrisma.leaderboard.create.mockResolvedValue({ id: 1 });

        await service.create("session-1", "  Alice  ");

        expect(mockPrisma.leaderboard.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ playerName: "Alice" }),
          }),
        );
      });
    });

    describe("game session state", () => {
      it("throws NotFoundException when session does not exist", async () => {
        mockPrisma.gameSession.findUnique.mockResolvedValue(null);
        await expect(service.create("session-1", "Alice")).rejects.toThrow(
          NotFoundException,
        );
      });

      it("throws BadRequestException when game is still IN_PROGRESS", async () => {
        mockPrisma.gameSession.findUnique.mockResolvedValue({
          id: "session-1",
          status: GameStatus.IN_PROGRESS,
          leaderboard: null,
          attemptsUsed: 3,
          dayWordId: 1,
        });
        await expect(service.create("session-1", "Alice")).rejects.toThrow(
          BadRequestException,
        );
      });

      it("throws ConflictException when a leaderboard entry already exists for the session", async () => {
        mockPrisma.gameSession.findUnique.mockResolvedValue({
          id: "session-1",
          status: GameStatus.WON,
          leaderboard: { id: 99 },
          attemptsUsed: 3,
          dayWordId: 1,
        });
        await expect(service.create("session-1", "Alice")).rejects.toThrow(
          ConflictException,
        );
      });
    });

    describe("successful creation", () => {
      it("creates and returns a leaderboard entry for a won game", async () => {
        mockPrisma.gameSession.findUnique.mockResolvedValue({
          id: "session-1",
          status: GameStatus.WON,
          leaderboard: null,
          attemptsUsed: 3,
          dayWordId: 1,
        });
        const entry = {
          id: 1,
          playerName: "Alice",
          attempts: 3,
          won: true,
          dayWordId: 1,
          gameSessionId: "session-1",
          createdAt: new Date(),
        };
        mockPrisma.leaderboard.create.mockResolvedValue(entry);

        const result = await service.create("session-1", "Alice");

        expect(mockPrisma.leaderboard.create).toHaveBeenCalledWith({
          data: {
            playerName: "Alice",
            attempts: 3,
            won: true,
            dayWordId: 1,
            gameSessionId: "session-1",
          },
        });
        expect(result).toEqual(entry);
      });

      it("creates a leaderboard entry with won=false for a lost game", async () => {
        mockPrisma.gameSession.findUnique.mockResolvedValue({
          id: "session-2",
          status: GameStatus.LOST,
          leaderboard: null,
          attemptsUsed: 6,
          dayWordId: 2,
        });
        const entry = {
          id: 2,
          playerName: "Bob",
          attempts: 6,
          won: false,
          dayWordId: 2,
          gameSessionId: "session-2",
          createdAt: new Date(),
        };
        mockPrisma.leaderboard.create.mockResolvedValue(entry);

        const result = await service.create("session-2", "Bob");

        expect(mockPrisma.leaderboard.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ won: false, attempts: 6 }),
          }),
        );
        expect(result.won).toBe(false);
      });
    });
  });

  // ─── findByDate ───────────────────────────────────────────────────────────

  describe("findByDate", () => {
    describe("date validation", () => {
      it("throws BadRequestException for an invalid date string", async () => {
        await expect(service.findByDate("not-a-date")).rejects.toThrow(
          BadRequestException,
        );
        expect(mockPrisma.dayWord.findUnique).not.toHaveBeenCalled();
      });

      it("uses today's date at midnight when date is omitted", async () => {
        mockPrisma.dayWord.findUnique.mockResolvedValue(null);

        await service.findByDate(undefined);

        const arg = mockPrisma.dayWord.findUnique.mock.calls[0][0] as {
          where: { date: Date };
        };
        const today = new Date();
        expect(arg.where.date.getFullYear()).toBe(today.getFullYear());
        expect(arg.where.date.getMonth()).toBe(today.getMonth());
        expect(arg.where.date.getDate()).toBe(today.getDate());
        expect(arg.where.date.getHours()).toBe(0);
        expect(arg.where.date.getMinutes()).toBe(0);
      });
    });

    describe("missing day word", () => {
      it("returns an empty array when no dayWord exists for the date", async () => {
        mockPrisma.dayWord.findUnique.mockResolvedValue(null);
        const result = await service.findByDate("2024-01-01");
        expect(result).toEqual([]);
        expect(mockPrisma.leaderboard.findMany).not.toHaveBeenCalled();
      });
    });

    describe("sorting", () => {
      beforeEach(() => {
        mockPrisma.dayWord.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.leaderboard.findMany.mockResolvedValue([]);
      });

      it("defaults to attempts asc when no sort params are given", async () => {
        await service.findByDate("2024-01-01");
        expect(mockPrisma.leaderboard.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ attempts: "asc" }, { createdAt: "asc" }],
          }),
        );
      });

      it.each(["playerName", "attempts", "won", "createdAt"])(
        "accepts valid sort key '%s'",
        async (sort) => {
          await service.findByDate("2024-01-01", 50, sort);
          expect(mockPrisma.leaderboard.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              orderBy: [{ [sort]: "asc" }, { createdAt: "asc" }],
            }),
          );
        },
      );

      it("falls back to attempts when sort key is not in the allowed list", async () => {
        await service.findByDate("2024-01-01", 50, "hackfield");
        expect(mockPrisma.leaderboard.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ attempts: "asc" }, { createdAt: "asc" }],
          }),
        );
      });
    });

    describe("limit", () => {
      it("passes the limit to findMany", async () => {
        mockPrisma.dayWord.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.leaderboard.findMany.mockResolvedValue([]);

        await service.findByDate("2024-01-01", 10);

        expect(mockPrisma.leaderboard.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ take: 10 }),
        );
      });
    });

    describe("result filtering", () => {
      it("filters leaderboard entries by the resolved dayWordId", async () => {
        mockPrisma.dayWord.findUnique.mockResolvedValue({ id: 42 });
        mockPrisma.leaderboard.findMany.mockResolvedValue([]);

        await service.findByDate("2024-06-15");

        expect(mockPrisma.leaderboard.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { dayWordId: 42 } }),
        );
      });

      it("returns the entries returned by findMany", async () => {
        const entries = [
          { id: 1, playerName: "Alice", attempts: 2, won: true },
          { id: 2, playerName: "Bob", attempts: 4, won: true },
        ];
        mockPrisma.dayWord.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.leaderboard.findMany.mockResolvedValue(entries);

        const result = await service.findByDate("2024-01-01");

        expect(result).toEqual(entries);
      });
    });
  });
});
