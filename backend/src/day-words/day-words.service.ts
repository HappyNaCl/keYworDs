import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DayWordsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DayWordsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.ensureToday();
  }

  async ensureToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dayWord.findUnique({
      where: { date: today },
    });
    if (existing) {
      this.logger.log(
        `Today's word already exists, which is ${existing.wordId}`,
      );
      return existing;
    }

    const word = await this.pickRandomWord();
    if (!word) {
      throw new Error("No words found in database, please run seeding first!");
    }

    try {
      const created = await this.prisma.dayWord.create({
        data: { date: today, wordId: word.id },
      });

      this.logger.log(`Today's word is ${created.wordId}`);
      return created;
    } catch (err: any) {
      throw err;
    }
  }

  private async pickRandomWord() {
    const rows = await this.prisma.$queryRaw<
      { id: number; text: string }[]
    >`SELECT id, text FROM Word ORDER BY RAND() LIMIT 1`;
    return rows[0] ?? null;
  }
}
