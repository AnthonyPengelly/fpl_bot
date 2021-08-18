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
  return;
};
