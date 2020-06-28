import PlayerScore from "../models/PlayerScore";
import fs from "fs";
import moment from "moment";

export default class DataRecorder {
  async recordData(players: PlayerScore[], nextEventId: number) {
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
    const folderDate = moment().format("YYYY/MM");
    await fs.promises.mkdir(`./data/${folderDate}`, { recursive: true });
    return fs.promises.writeFile(
      `./data/${dateString}.json`,
      JSON.stringify(data, null, 2),
      "utf8"
    );
  }

  async getLatestScores() {
    const years = await this.getSortedContentsInPath("./data");
    if (years.length === 0) {
      return undefined;
    }
    const year = years.pop()!;
    const months = await this.getSortedContentsInPath(`./data/${year}`);
    if (months.length === 0) {
      return undefined;
    }
    const month = months.pop();
    const scoreFiles = await this.getSortedContentsInPath(`./data/${year}/${month}`);
    if (scoreFiles.length === 0) {
      return undefined;
    }
    const latestScoreFile = scoreFiles.pop();
    return require(`../../data/${year}/${month}/${latestScoreFile}`) as GameweekScores;
  }

  private async getSortedContentsInPath(path: string) {
    return (await fs.promises.readdir(path, { withFileTypes: true }))
      .map((fileOrDirectory) => fileOrDirectory.name)
      .sort();
  }
}
