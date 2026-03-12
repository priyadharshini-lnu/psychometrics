export type ScoreDefinition = {
  score: string | number
  definition: string
}
declare class Scoring {
  constructor(attrs, factorId: number)

  ai_scoring_config: Record<string, string>

  setEngine(type: string): void

  changeAiScoringConfig(...args: type[]): void

  removeAiScoringConfig(): void

  initializeAiScoringConfig(defaultPromt: {what_to_look_for: string, score_definitions: ScoreDefinition[]}): void
}

export = Scoring
