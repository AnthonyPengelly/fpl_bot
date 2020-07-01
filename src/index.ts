import { exit } from "process";
import CliRunner from "./services/cliRunner";

console.log();
console.log("Welcome to FPL bot!");

if (process.argv.length < 3) {
  console.error(
    `Please enter a command to begin. The currently supported commands are:
    ${CliRunner.TOP_PLAYERS_CMD}, ${CliRunner.RECOMMEND_SQUAD_CMD}, ${CliRunner.RECOMMEND_TRANSFERS_CMD}, ${CliRunner.RECOMMEND_LINEUP_CMD}`
  );
  exit(1);
}

const cliRunner = new CliRunner();
cliRunner.run(process.argv[2], process.argv[3]).catch((error) => console.error(error));
