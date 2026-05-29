import { Test, TestingModule } from "@nestjs/testing";
import { LeaderboardsController } from "./leaderboards.controller";
import { LeaderboardsService } from "./leaderboards.service";
import type { Request } from "express";

const mockLeaderboardsService = {
  create: jest.fn(),
  findByDate: jest.fn(),
};

const makeRequest = (sessionId?: string): Request =>
  ({
    cookies: sessionId !== undefined ? { gameSessionId: sessionId } : {},
  }) as unknown as Request;

describe("LeaderboardsController", () => {
  let controller: LeaderboardsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardsController],
      providers: [
        {
          provide: LeaderboardsService,
          useValue: mockLeaderboardsService,
        },
      ],
    }).compile();

    controller = module.get<LeaderboardsController>(LeaderboardsController);
  });

  // ─── POST /leaderboards ───────────────────────────────────────────────────

  describe("create (POST /leaderboards)", () => {
    it("passes the gameSessionId cookie and playerName to the service", async () => {
      const entry = { id: 1, playerName: "Alice" };
      mockLeaderboardsService.create.mockResolvedValue(entry);

      const result = await controller.create(makeRequest("session-abc"), {
        playerName: "Alice",
      });

      expect(mockLeaderboardsService.create).toHaveBeenCalledWith(
        "session-abc",
        "Alice",
      );
      expect(result).toEqual(entry);
    });

    it("passes undefined sessionId when the cookie is absent", async () => {
      mockLeaderboardsService.create.mockResolvedValue({});

      await controller.create(makeRequest(), { playerName: "Alice" });

      expect(mockLeaderboardsService.create).toHaveBeenCalledWith(
        undefined,
        "Alice",
      );
    });

    it("passes undefined sessionId when cookies object is missing entirely", async () => {
      const req = {} as unknown as Request;
      mockLeaderboardsService.create.mockResolvedValue({});

      await controller.create(req, { playerName: "Alice" });

      expect(mockLeaderboardsService.create).toHaveBeenCalledWith(
        undefined,
        "Alice",
      );
    });

    it("returns whatever the service resolves with", async () => {
      const entry = {
        id: 7,
        playerName: "Eve",
        attempts: 3,
        won: true,
        createdAt: new Date(),
      };
      mockLeaderboardsService.create.mockResolvedValue(entry);

      const result = await controller.create(makeRequest("s"), {
        playerName: "Eve",
      });

      expect(result).toEqual(entry);
    });
  });

  // ─── GET /leaderboards ────────────────────────────────────────────────────

  describe("findAll (GET /leaderboards)", () => {
    it("forwards date, limit and sort to the service", async () => {
      const entries = [{ id: 1 }, { id: 2 }];
      mockLeaderboardsService.findByDate.mockResolvedValue(entries);

      const result = await controller.findAll("2024-06-01", 10, "playerName");

      expect(mockLeaderboardsService.findByDate).toHaveBeenCalledWith(
        "2024-06-01",
        10,
        "playerName",
      );
      expect(result).toEqual(entries);
    });

    it("passes undefined date and sort when not supplied by the query string", async () => {
      mockLeaderboardsService.findByDate.mockResolvedValue([]);

      await controller.findAll(undefined, 50, undefined);

      expect(mockLeaderboardsService.findByDate).toHaveBeenCalledWith(
        undefined,
        50,
        undefined,
      );
    });

    it("returns an empty array when the service returns one", async () => {
      mockLeaderboardsService.findByDate.mockResolvedValue([]);

      const result = await controller.findAll(undefined, 50, undefined);

      expect(result).toEqual([]);
    });

    it("uses the default limit (50) supplied by DefaultValuePipe", async () => {
      mockLeaderboardsService.findByDate.mockResolvedValue([]);

      await controller.findAll(undefined, 50, undefined);

      expect(mockLeaderboardsService.findByDate).toHaveBeenCalledWith(
        undefined,
        50,
        undefined,
      );
    });
  });
});
