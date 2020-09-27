import Twit from "twit";

export default class TwitterApiClient {
  async tweet(status: string): Promise<void> {
    const twitClient = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY!,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
      access_token: process.env.TWITTER_ACCESS_KEY!,
      access_token_secret: process.env.TWITTER_TOKEN_SECRET!,
    });

    await new Promise((resolve, reject) =>
      twitClient.post("statuses/update", { status }, (error, data, response) => {
        if (response.statusCode !== 200 || error) {
          reject(error);
        }
        resolve();
      })
    );
  }
}
