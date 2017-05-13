import * as WebRequest from 'web-request';

export default class FplFetcher {
    static baseUrl: string = "https://fantasy.premierleague.com/drf";

    static async getOverview() {
        let url = this.baseUrl + "/bootstrap-static";
        var overview = await WebRequest.json<Overview>(url);
        return await overview;
    }

    static async getMyTeam(gameweek: number) {
        let url = this.baseUrl + "/entry/2888136/event/" + gameweek + "/picks";
        var myTeam = await WebRequest.json<FantasyTeam>(url);
        return await myTeam;
    }

    static async getPlayer(id: number) {
        let url = this.baseUrl + "/element-summary/" + id;
        var playerDetails = await WebRequest.json<PlayerDetails>(url);
        return await playerDetails;    
    }
}