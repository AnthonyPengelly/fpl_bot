import FplFetcher from "../../fetchers/fplFetcher";

const fplFetcher = new FplFetcher();

describe("fplFetcher", () => {
  test("getOverview returns required fields", async () => {
    const result = await fplFetcher.getOverview();

    expect(result.elements.length).toBeGreaterThan(100);
    expect(result.elements[0].id).toBeTruthy();
    expect(result.elements[0].web_name).toBeTruthy();
    expect(result.elements[0].now_cost).toBeTruthy();
    expect(result.elements[0].element_type).toBeTruthy();
    expect(result.elements[0].team).toBeTruthy();
    expect(result.elements[0].code).toBeTruthy();
    expectToBeNumeric(result.elements[0].form);
    expectToBeNumeric(result.elements[0].points_per_game);
    expectToBeNumeric(result.elements[0].ict_index);
    expectToBeNumeric(result.elements[0].chance_of_playing_next_round);

    expect(result.events.length).toBeGreaterThan(20);
    expect(result.events[0].id).toBeTruthy();
    expect(result.events[0].deadline_time).toBeTruthy();
    expect(result.events[0].finished === true || result.events[0].finished === false).toBeTruthy();
    expect(result.events[0].is_next === true || result.events[0].is_next === false).toBeTruthy();

    expect(result.teams.length).toBe(20);
    expect(result.teams[0].id).toBeTruthy();
    expect(result.teams[0].short_name).toBeTruthy();
    expect(result.teams[0].strength).toBeTruthy();
    expect(result.teams[0].strength_attack_away).toBeTruthy();
    expect(result.teams[0].strength_attack_home).toBeTruthy();
    expect(result.teams[0].strength_defence_away).toBeTruthy();
    expect(result.teams[0].strength_defence_home).toBeTruthy();
    expect(result.teams[0].strength_overall_away).toBeTruthy();
    expect(result.teams[0].strength_overall_home).toBeTruthy();

    expect(result.element_types.length).toBe(4);
    expect(result.element_types[0].id).toBeTruthy();
    expect(result.element_types[0].singular_name).toBeTruthy();
  }, 15000);

  test("getFixtures returns required fields", async () => {
    const result = await fplFetcher.getFixtures();

    expect(result.length).toBeGreaterThan(100);
    expect(result[0].finished === true || result[0].finished === false).toBeTruthy();
    expect(result[0].event || result[0].event === null).toBeTruthy();
    expect(result[0].team_h).toBeTruthy();
    expect(result[0].team_a).toBeTruthy();
  }, 15000);

  test("getMyDetails returns required fields", async () => {
    const result = await fplFetcher.getMyDetails();

    expect(result.player.entry).toBeTruthy();
  }, 15000);

  test("getMyTeam returns required fields", async () => {
    const myDetails = await fplFetcher.getMyDetails();
    const result = await fplFetcher.getMyTeam(myDetails.player.entry);

    expect(result.picks.length).toBe(15);
    expect(result.picks[0].element).toBeTruthy();
    expect(result.picks[0].selling_price).toBeTruthy();
    expect(typeof result.transfers.bank).toBe("number");
    expect(result.transfers.limit || result.transfers.limit === null).toBeTruthy();
  }, 15000);

  test("getDraftOverview returns required fields", async () => {
    const result = await fplFetcher.getDraftOverview();

    expect(result.elements.length).toBeGreaterThan(100);
    expect(result.elements[0].code).toBeTruthy();
  }, 15000);

  test("getMyDraftInfo returns required fields", async () => {
    const result = await fplFetcher.getMyDraftInfo();

    expect(result.leagues.length).toBe(1);
    expect(result.leagues[0].id).toBeTruthy();
    expect(result.player.entry_set.length).toBe(1);
    expect(result.player.entry_set[0]).toBeTruthy();
  }, 15000);

  test("getDraftStatus returns required fields", async () => {
    const draftInfo = await fplFetcher.getMyDraftInfo();
    const result = await fplFetcher.getDraftStatus(draftInfo.leagues[0].id);

    expect(result.element_status.length).toBeGreaterThan(100);
    expect(result.element_status[0].element).toBeTruthy();
    expect(result.element_status[0].owner || result.element_status[0].owner === null).toBeTruthy();
  }, 15000);

  test("getMyDraftTeam returns required fields", async () => {
    const draftInfo = await fplFetcher.getMyDraftInfo();
    const result = await fplFetcher.getMyDraftTeam(draftInfo.player.entry_set[0]);

    expect(result.picks.length).toBe(15);
    expect(result.picks[0].element).toBeTruthy();
  }, 15000);
});

const expectToBeNumeric = (actual: any) => {
  expect(!isNaN(actual)).toBeTruthy();
};
