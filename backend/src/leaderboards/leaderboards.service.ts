import { Injectable } from "@nestjs/common";

@Injectable()
export class LeaderboardsService {
  constructor() {}

  async create(sessionId: string | undefined, playerName: string) {
    /*
      TODO (No. 10): Make a leaderboard entry by following these steps
      1. Validate if sessionId exists, if it doesn't exist return an Unauthorized response
      2. Validate that the playerName is not empty, if it is return a Bad Request response
      3. Get the gameSession based on sessionId
      4. Validate if the Game Session exist in database, if it doesn't exist return a Not Found response
      5. Validate if the Game Session has ended, if it is not finished return a Bad Request response
      6. Validate if a leaderboard entry has been made based on the Game Session, if it has been made return a Conflict response
      7. Insert into database
      8. Return the inserted row back to the user
    */
  }

  async findByDate() {
    // TODO (No. 11): Get all leaderboard entries while following these specifications
    // 1. sort by attempt or createdBy
    // 2. limits result to only N numbers
    // 3. filtered by date
  }
}
