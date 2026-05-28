import { Module } from "@nestjs/common";
import { DayWordsService } from "./day-words.service";

@Module({
  providers: [DayWordsService],
  exports: [DayWordsService],
})
export class DayWordsModule {}
