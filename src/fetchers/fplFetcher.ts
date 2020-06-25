import * as WebRequest from "web-request";
import axios from "axios";

export default class FplFetcher {
  private baseUrl: string = "https://fantasy.premierleague.com/api";
  private cookies: string;

  constructor() {
    // Parse the response from the auth request, which was performed in
    // the bash script.
    if (!process.env.FPL_AUTH_HEADERS) {
      throw "Env variable FPL_AUTH_HEADERS must be set!";
    }
    const splitOnSetCookie = process.env.FPL_AUTH_HEADERS!.split("set-cookie: ");
    const cookiesArray = splitOnSetCookie.slice(1).map((x) => x.split("; ")[0]);
    this.cookies = cookiesArray.join("; ") + ";";
  }

  async getOverview() {
    let url = this.baseUrl + "/bootstrap-static/";
    var overview = await WebRequest.json<Overview>(url);
    return overview;
  }

  async getPlayer(id: number) {
    let url = this.baseUrl + "/element-summary/" + id + "/";
    var playerDetails = await WebRequest.json<PlayerDetails>(url);
    return playerDetails;
  }

  async getFixtures() {
    let url = this.baseUrl + "/fixtures/";
    var fixtures = await WebRequest.json<Fixture[]>(url);
    return fixtures;
  }

  async getMyDetails() {
    let url = this.baseUrl + "/me/";
    var myTeam = await WebRequest.json<MyDetails>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async getMyTeam(teamId: number) {
    let url = this.baseUrl + "/my-team/" + teamId;
    var myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async setLineup(lineup: MyTeamRequest, teamId: number) {
    let url = this.baseUrl + "/my-team/" + teamId + "/";
    const response = await WebRequest.post(
      url,
      {
        headers: {
          Cookie: this.cookies,
          "Content-Type": "application/json",
        },
      },
      JSON.stringify(lineup)
    );
    if (response.statusCode !== 200) {
      throw response.content;
    }
  }

  async performTransfers(transferRequest: TransferRequest) {
    let url = this.baseUrl + "/transfers/";
    const response = await WebRequest.post(
      url,
      {
        headers: {
          Cookie: this.cookies,
          "Content-Type": "application/json",
        },
      },
      JSON.stringify(transferRequest)
    );
    if (response.statusCode !== 200) {
      throw response.content;
    }
  }
}
