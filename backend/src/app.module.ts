import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { WordsModule } from "./words/words.module";
import { LeaderboardsModule } from "./leaderboards/leaderboards.module";
import { PrismaModule } from "./prisma/prisma.module";
import { DayWordsModule } from "./day-words/day-words.module";
import { GamesModule } from "./games/games.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    WordsModule,
    LeaderboardsModule,
    DayWordsModule,
    GamesModule,
  ],
})
export class AppModule {}
