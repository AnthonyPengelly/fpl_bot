# FPL Bot

The FPL bot is an autonomous fantasy premier league bot. Every week, it scores all the players in the league,
and makes transfers and sets its lineup based on these scores. It also has a CLI allowing various other 
interactions with these scores including:
* Viewing details on a players score
* Listing the top players in each position
* Suggesting squads for a budget to maximise the score for different formations
* Suggesting transactions for draft mode

## Running Autonomously

An AWS Lambda can be created to run each night to allow the bot to play autonomously. The code for this
can be generated by running `npm run build:lambda`. This will produce a `package.zip` file with the code. The handler should be set to `handler.handler` and make
sure to set the timeout to over 1 minute.

The following environment variables should be set:

| Name             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `BUCKET_NAME`    | S3 bucket in which to store the logs and data           |
| `FPL_EMAIL`      | Fantasy Premier League email address for account        |
| `FPL_PASSWORD`   | Fantasy Premier League password for account             |
| `DRAFT_EMAIL`    | Draft Premier League email address if using draft       |
| `DRAFT_PASSWORD` | Draft Premier League password                           |
| `SENT_TO_EMAIL`  | Email to send updates to. This must be setup within SES |

## Running locally

Run the following to install dependencies:
```
npm install
```

Then (once you have set the env variables as above), you can run the CLI with:
```
npm start top-players
```
Or any other command.
