import PlayerScore from "../models/PlayerScore";
import fs from "fs";
import moment from "moment";
import { S3 } from "aws-sdk";

export default class DataRecorder {
  async recordData(players: PlayerScore[], nextEventId: number) {
    if (!process.env.BUCKET_NAME) {
      throw "Add BUCKET_NAME env variable!";
    }
    const data: GameweekScores = {
      event: nextEventId,
      playerData: players.map((player) => ({
        name: player.player.web_name,
        id: player.player.id,
        code: player.player.code,
        team: player.player.team,
        position: player.position.singular_name_short,
        score: player.score,
        value: player.value,
        scoreDetails: player.scoreDetails,
      })),
    };
    const dateString = moment().format("YYYY/MM/DD");

    const params = {
      Bucket: process.env.BUCKET_NAME as string,
      Key: `player-score-data/${dateString}.json`,
      ContentType: "application/json",
      Body: JSON.stringify(data, null, 2),
    };
    await new S3().putObject(params).promise();
  }

  async getLatestScores() {
    const params = {
      Bucket: process.env.BUCKET_NAME as string,
      Prefix: "player-score-data/",
    };
    const scoreObjects = await new S3().listObjectsV2(params).promise();
    const latestScore = scoreObjects.Contents?.sort((a, b) => b.Key!.localeCompare(a.Key!))[0];
    const scores = await new S3()
      .getObject({
        Bucket: process.env.BUCKET_NAME as string,
        Key: latestScore!.Key!,
      })
      .promise();
    return JSON.parse(scores.Body as string) as GameweekScores;
  }
}
