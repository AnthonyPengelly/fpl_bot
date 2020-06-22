import * as WebRequest from "web-request";
import axios from "axios";

export default class FplFetcher {
  private baseUrl: string = "https://fantasy.premierleague.com/api";
  private cookies: string[] = [];

  async init() {
    const url = "https://users.premierleague.com/accounts/login/";
    const payload = {
      password: "Newcastle1",
      login: "anthonype@blueyonder.co.uk",
      redirect_uri: "https://fantasy.premierleague.com/",
      app: "plfpl-web",
    };
    const response = await axios.request({
      method: "POST",
      url: url,
      data: JSON.stringify(payload),
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 303;
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        crossDomain: true,
      },
    });
    this.cookies = response.headers["set-cookie"];
  }

  async getOverview() {
    let url = this.baseUrl + "/bootstrap-static/";
    var overview = await WebRequest.json<Overview>(url);
    return overview;
  }

  async getMyTeam(gameweek: number) {
    let url = this.baseUrl + "/entry/2888136/event/" + gameweek + "/picks/";
    var myTeam = await WebRequest.json<FantasyTeam>(url);
    return myTeam;
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

  async getMyTeamAuthenticated(id: string) {
    let url = this.baseUrl + "/my-team/" + id;
    console.log(this.cookies);
    var myTeam = await axios.get(url, {
      headers: {
        Cookie:
          this.cookies.map((cookie) => cookie.split(";")).join("; ") + ";",
      },
    });
    console.log(myTeam);
  }
}
