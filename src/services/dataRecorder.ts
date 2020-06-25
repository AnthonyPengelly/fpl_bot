import PlayerScore from "../models/PlayerScore";
import fs from "fs";
import moment from "moment";

export default class DataRecorder {
  recordData(players: PlayerScore[]) {
    return new Promise((resolve, reject) => {
      const data = players.map((player) => ({
        name: player.player.web_name,
        id: player.player.id,
        team: player.player.team,
        position: player.position.singular_name_short,
        score: player.score,
        value: player.value,
        scoreDetails: player.scoreDetails,
      }));
      const dateString = moment().format("YYYY-MM-DD");
      fs.writeFile(`./data/${dateString}.json`, JSON.stringify(data), "utf8", () => resolve());
    });
  }
}
