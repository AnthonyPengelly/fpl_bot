import CliRunner from "./services/cliRunner";
import { Logger } from "./services/logger";

export const handler = async () => {
  const emailToSendTo = process.env.SEND_TO_EMAIL ?? (process.env.FPL_EMAIL as string);
  const logger = new Logger();
  try {
    const cliRunner = new CliRunner(logger);
    await cliRunner.run("run", "");
    await logger.uploadOutput("bot-logs");
    await logger.sendEmailIfNeeded("FPL Update", emailToSendTo);
  } catch (error) {
    logger.log(error);
    logger.setShouldSendEmail();
    await logger.uploadOutput("bot-logs");
    await logger.sendEmailIfNeeded("FPL Error", emailToSendTo);
  }

  const draftLogger = new Logger();
  try {
    const draftRunner = new CliRunner(draftLogger);
    process.env.FPL_EMAIL = process.env.DRAFT_EMAIL;
    process.env.FPL_PASSWORD = process.env.DRAFT_PASSWORD;
    await draftRunner.run("draft-run", "");
    await draftLogger.uploadOutput("draft-bot-logs");
    await draftLogger.sendEmailIfNeeded("FPL Draft Update", emailToSendTo);
  } catch (error) {
    draftLogger.log(error);
    draftLogger.setShouldSendEmail();
    await draftLogger.uploadOutput("draft-bot-logs");
    await draftLogger.sendEmailIfNeeded("FPL Draft Error", emailToSendTo);
  }
  return;
};
