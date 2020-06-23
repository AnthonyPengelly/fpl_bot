import { OptimisationSettings } from "../config/optimisationSettings";
import PlayerScore from "../models/PlayerScore";
import { PositionMap } from "../models/PositionMap";
import OptimisationService from "./optimisationService";

export default class RecommendationService {
  constructor(
    private optimisationService: OptimisationService,
    private playerScores: PlayerScore[]
  ) {}

  recommendATeam(settings: OptimisationSettings, budget: number) {
    return this.optimisationService.getOptimalTeamForSettings(
      this.playerScores,
      settings,
      budget
    );
  }
}
