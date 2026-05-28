import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { GameSession, GameStatus, Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { LetterScore, scoreGuess } from "./score";

export const MAX_ATTEMPTS = 6;

type GuessRecord = { guess: string; pattern: LetterScore[] };

type SessionResponse = {
  id: string;
  attemptsUsed: number;
  maxAttempts: number;
  wordLength: number;
  status: GameStatus;
  guesses: GuessRecord[];
  answer?: string;
};

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async startOrResume(sessionId: string | undefined): Promise<SessionResponse> {
    const today = this.todayMidnight();
    const dayWord = await this.prisma.dayWord.findUnique({
      where: { date: today },
      include: { word: true },
    });
    if (!dayWord) {
      throw new NotFoundException("No puzzle for today yet");
    }

    if (sessionId) {
      const existing = await this.prisma.gameSession.findUnique({
        where: { id: sessionId },
      });
      if (existing && existing.dayWordId === dayWord.id) {
        return this.toResponse(existing, dayWord.word.text);
      }
    }

    const created = await this.prisma.gameSession.create({
      data: { dayWordId: dayWord.id, guesses: [] },
    });
    return this.toResponse(created, dayWord.word.text);
  }

  async submitGuess(
    sessionId: string | undefined,
    rawGuess: string,
  ): Promise<SessionResponse> {
    if (!sessionId) {
      throw new UnauthorizedException("No active game session");
    }

    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { dayWord: { include: { word: true } } },
    });
    if (!session) {
      throw new NotFoundException("Game session not found");
    }
    if (session.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException("Game already finished");
    }

    const answer = session.dayWord.word.text;
    const guess = (rawGuess ?? "").trim().toLowerCase();
    if (guess.length !== answer.length) {
      throw new BadRequestException(
        `Guess must be ${answer.length} letters long`,
      );
    }

    const known = await this.prisma.word.findUnique({ where: { text: guess } });
    if (!known) {
      throw new BadRequestException("Not in word list");
    }

    const pattern = scoreGuess(guess, answer);
    const guesses = [
      ...((session.guesses as unknown as GuessRecord[]) ?? []),
      { guess, pattern },
    ];
    const attemptsUsed = session.attemptsUsed + 1;
    const won = pattern.every((p) => p === "hit");
    const lost = !won && attemptsUsed >= MAX_ATTEMPTS;
    const status = won
      ? GameStatus.WON
      : lost
        ? GameStatus.LOST
        : GameStatus.IN_PROGRESS;

    const updated = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        guesses: guesses as unknown as Prisma.InputJsonValue,
        attemptsUsed,
        status,
        finishedAt: status === GameStatus.IN_PROGRESS ? null : new Date(),
      },
    });

    return this.toResponse(updated, answer);
  }

  private toResponse(session: GameSession, answer: string): SessionResponse {
    return {
      id: session.id,
      attemptsUsed: session.attemptsUsed,
      maxAttempts: MAX_ATTEMPTS,
      wordLength: answer.length,
      status: session.status,
      guesses: (session.guesses as unknown as GuessRecord[]) ?? [],
      answer:
        session.status === GameStatus.IN_PROGRESS ? undefined : answer,
    };
  }

  private todayMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
