import * as WebRequest from "web-request";

export default class FplFetcher {
  private baseUrl: string = "https://fantasy.premierleague.com/api";
  private draftBaseUrl: string = "https://draft.premierleague.com/api";
  private cookies = process.env.FPL_COOKIE;
  private draftCsrfToken = process.env.FPL_CSRF_COOKIE;

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
    const url = this.baseUrl + "/me/";
    const myDetails = await WebRequest.json<MyDetails>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myDetails;
  }

  async getMyTeam(teamId: number) {
    const url = this.baseUrl + "/my-team/" + teamId;
    const myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async getMyGameweekTeam(teamId: number, gameweek: Gameweek) {
    const url = this.baseUrl + `/entry/${teamId}/event/${gameweek.id}/picks/`;
    const myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async setLineup(lineup: MyTeamRequest, teamId: number) {
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
    const url = this.draftBaseUrl + "/bootstrap-dynamic";
    const draftStatus = await WebRequest.json<DraftInfo>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return draftStatus;
  }

  async getDraftStatus(leagueId: number) {
    const url = this.draftBaseUrl + `/league/${leagueId}/element-status`;
    const draftStatus = await WebRequest.json<DraftStatus>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return draftStatus;
  }

  async getMyDraftTeam(teamId: number) {
    const url = this.draftBaseUrl + `/entry/${teamId}/my-team`;
    const myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async getMyDraftGameweekTeam(teamId: number, gameweek: Gameweek) {
    const url = this.draftBaseUrl + `/entry/${teamId}/event/${gameweek.id}`;
    const myTeam = await WebRequest.json<MyTeam>(url, {
      headers: {
        Cookie: this.cookies,
      },
    });
    return myTeam;
  }

  async setDraftLineup(lineup: MyTeamRequest, teamId: number) {
    const url = this.draftBaseUrl + `/entry/${teamId}/my-team`;
    const response = await WebRequest.post(
      url,
      {
        headers: {
          Cookie: `${this.cookies} csrftoken=${this.draftCsrfToken};`,
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
    const url = this.draftBaseUrl + `/draft/entry/${teamId}/waivers`;
    const response = await WebRequest.post(
      url,
      {
        headers: {
          Cookie: `${this.cookies} csrftoken=${this.draftCsrfToken};`,
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
}
