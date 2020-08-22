import CliRunner from "./services/cliRunner";
import { Logger } from "./services/logger";

export const handler = async () => {
  const logger = new Logger();
  const cliRunner = new CliRunner(logger);
  await cliRunner.run("run", "");
  await logger.uploadOutput("bot-logs");
  await logger.sendEmailIfNeeded("FPL Update");

  const draftLogger = new Logger();
  const draftRunner = new CliRunner(draftLogger);
  process.env.FPL_EMAIL = process.env.DRAFT_EMAIL;
  process.env.FPL_PASSWORD = process.env.DRAFT_PASSWORD;
  await draftRunner.run("draft-run", "");
  await draftLogger.uploadOutput("draft-bot-logs");
  await draftLogger.sendEmailIfNeeded("FPL Draft Update");
  return;
};
