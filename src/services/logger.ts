import { S3, SES } from "aws-sdk";
import moment from "moment";

export class Logger {
  private output = "";
  private shouldSendEmail = false;

  log(message: string) {
    console.log(message);
    this.output += `\n${message}`;
  }

  getOutput() {
    return this.output;
  }

  setShouldSendEmail() {
    this.shouldSendEmail = true;
  }

  async uploadOutput(folder: string) {
    const dateString = moment().format("YYYY/MM/DD");
    await new S3()
      .putObject({
        Bucket: process.env.BUCKET_NAME as string,
        Key: `${folder}/${dateString}.txt`,
        ContentType: "text/plain",
        Body: this.output,
      })
      .promise();
  }

  async sendEmailIfNeeded(subject: string) {
    if (!this.shouldSendEmail) {
      return;
    }
    await new SES()
      .sendEmail({
        Destination: {
          ToAddresses: [process.env.FPL_EMAIL as string],
        },
        Message: {
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: this.output,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
        },
        Source: process.env.FPL_EMAIL as string,
      })
      .promise();
  }
}
