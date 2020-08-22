import CliRunner from "./services/cliRunner";

export const handler = async () => {
  const cliRunner = new CliRunner();
  await cliRunner.run("run", "");
  const draftRunner = new CliRunner();
  process.env.FPL_EMAIL = process.env.DRAFT_EMAIL;
  process.env.FPL_PASSWORD = process.env.DRAFT_PASSWORD;
  await draftRunner.run("draft-run", "");
  return;
};
