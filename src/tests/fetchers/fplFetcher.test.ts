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
    expect(result.elements[0].form).toBeTruthy();
    expect(result.elements[0].points_per_game).toBeTruthy();
    expect(result.elements[0].ict_index).toBeTruthy();
    expect(result.elements[0].chance_of_playing_next_round).toBeTruthy();

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
  });
});

// Overview returns correct shape

// get player returns correct shape

// get fixtures returns correct shape
