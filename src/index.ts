import { exit } from "process";
import CliRunner from "./services/cliRunner";

console.log("Welcome to FPL bot!");

if (
  process.argv.length !== 3 ||
  (process.argv[2] !== CliRunner.RECOMMEND_SQUAD_CMD &&
    process.argv[2] !== CliRunner.RECOMMEND_TRANSFERS_CMD &&
    process.argv[2] !== CliRunner.TOP_PLAYERS_CMD)
) {
  console.error(
    `Please enter a command to begin. The currently supported commands are:
    ${CliRunner.TOP_PLAYERS_CMD}, ${CliRunner.RECOMMEND_SQUAD_CMD}, ${CliRunner.RECOMMEND_TRANSFERS_CMD}`
  );
  exit(1);
}

const cliRunner = new CliRunner();
cliRunner.init().then(() => cliRunner.run(process.argv[2]));
