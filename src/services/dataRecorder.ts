import PlayerScore from "../models/PlayerScore";
import fs from "fs";
import moment from "moment";

export default class DataRecorder {
  async recordData(players: PlayerScore[], nextEventId: number) {
    const data = {
      event: nextEventId,
      playerData: players.map((player) => ({
        name: player.player.web_name,
        id: player.player.id,
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
    return fs.promises.writeFile(`./data/${dateString}.json`, JSON.stringify(data), "utf8");
  }
}
