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
    const splitOnSetCookie = process.env.FPL_AUTH_HEADERS!.split(
      "set-cookie: "
    );
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

  async getFixtures(eventId: number) {
    let url = this.baseUrl + "/fixtures/?event=" + eventId;
    var fixtures = await WebRequest.json<Fixture[]>(url);
    return fixtures;
  }

  async getMyTeam() {
    if (!process.env.TEAM_ID) {
      throw "Env variable TEAM_ID must be set!";
    }
    let url = this.baseUrl + "/my-team/" + process.env.TEAM_ID;
    var myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }
}
