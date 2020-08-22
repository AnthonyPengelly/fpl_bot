import * as WebRequest from "web-request";
import axios from "axios";

export default class FplFetcher {
  private baseUrl: string = "https://fantasy.premierleague.com/api";
  private draftBaseUrl: string = "https://draft.premierleague.com/api";
  private usersBaseUrl: string = "https://users.premierleague.com";
  private cookies?: string;
  private draftCookies?: string;
  private draftCsrfToken?: string;

  async getOverview() {
    const url = this.baseUrl + "/bootstrap-static/";
    const overview = await WebRequest.json<Overview>(url);
    return overview;
  }

  async getPlayer(id: number) {
    const url = this.baseUrl + "/element-summary/" + id + "/";
    const playerDetails = await WebRequest.json<PlayerDetails>(url);
    return playerDetails;
  }

  async getFixtures() {
    const url = this.baseUrl + "/fixtures/";
    const fixtures = await WebRequest.json<Fixture[]>(url);
    return fixtures;
  }

  async getMyDetails() {
    await this.ensureLoggedIn();
    const url = this.baseUrl + "/me/";
    const myDetails = await WebRequest.json<MyDetails>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myDetails;
  }

  async getMyTeam(teamId: number) {
    await this.ensureLoggedIn();
    const url = this.baseUrl + "/my-team/" + teamId;
    const myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async setLineup(lineup: MyTeamRequest, teamId: number) {
    await this.ensureLoggedIn();
    const url = this.baseUrl + "/my-team/" + teamId + "/";
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
    await this.ensureLoggedIn();
    const url = this.baseUrl + "/transfers/";
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

  async getDraftOverview() {
    const url = this.draftBaseUrl + "/bootstrap-static";
    const overview = await WebRequest.json<Overview>(url);
    return overview;
  }

  async getMyDraftInfo() {
    await this.ensureLoggedIn();
    const url = this.draftBaseUrl + "/bootstrap-dynamic";
    const draftStatus = await WebRequest.json<DraftInfo>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return draftStatus;
  }

  async getDraftStatus(leagueId: number) {
    await this.ensureLoggedIn();
    const url = this.draftBaseUrl + `/league/${leagueId}/element-status`;
    const draftStatus = await WebRequest.json<DraftStatus>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    console.log(draftStatus);
    return draftStatus;
  }

  async getMyDraftTeam(teamId: number) {
    await this.ensureLoggedIn();
    const url = this.draftBaseUrl + `/entry/${teamId}/my-team`;
    const myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async setDraftLineup(lineup: MyTeamRequest, teamId: number) {
    await this.ensureLoggedIn(true);
    const url = this.draftBaseUrl + `/entry/${teamId}/my-team`;
    const response = await WebRequest.post(
      url,
      {
        headers: {
          Cookie: `${this.cookies} ${this.draftCookies}`,
          "Content-Type": "application/json",
          referer: "https://draft.premierleague.com/team/my",
          "x-csrftoken": this.draftCsrfToken,
        },
      },
      JSON.stringify(lineup)
    );
    if (response.statusCode !== 200) {
      throw response.content;
    }
  }

  async performTransactions(waivers: Waiver[], teamId: number) {
    await this.ensureLoggedIn(true);
    const url = this.draftBaseUrl + `/draft/entry/${teamId}/waivers`;
    const response = await WebRequest.post(
      url,
      {
        headers: {
          Cookie: `${this.cookies} ${this.draftCookies}`,
          "Content-Type": "application/json",
          referer: "https://draft.premierleague.com/team/transactions",
          "x-csrftoken": this.draftCsrfToken,
        },
      },
      JSON.stringify(waivers)
    );
    if (response.statusCode !== 200 && response.statusCode !== 201) {
      throw response.content;
    }
  }

  private async ensureLoggedIn(includeDraft = false) {
    if (!this.cookies) {
      await this.login();
    }
    if (includeDraft && !this.draftCookies) {
      await this.loginDraft();
    }
  }

  private async login() {
    const url = this.usersBaseUrl + "/accounts/login/";
    const response = await WebRequest.post(
      url,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      },
      `login=${process.env.FPL_EMAIL}&password=${process.env.FPL_PASSWORD}&app=plfpl-web&redirect_uri=https%3A%2F%2Ffantasy.premierleague.com%2F`
    );
    const cookiesArray: string[] = response.headers["set-cookie"];
    this.cookies = cookiesArray.map((x) => x.split("; ")[0]).join("; ") + ";";
  }

  private async loginDraft() {
    const url = this.draftBaseUrl + "/bootstrap-dynamic";
    const response = await WebRequest.get(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    const cookiesArray = (response.headers["set-cookie"] as string[]).map((x) => x.split("; ")[0]);
    this.draftCookies = cookiesArray.join("; ") + ";";
    const csrfCookie = cookiesArray.find((x) => x.indexOf("csrf") !== -1)!;
    this.draftCsrfToken = csrfCookie.split("=")[1];
  }
}
