interface ScoreDefinition {
  score: number
  definition: string
}


export const generateScoreDefinitionsFromRange = (
  min: number | null | undefined,
  max: number | null | undefined,
  existingDefinitions: ScoreDefinition[] = [],
): ScoreDefinition[] => {
  if (min === null || max === null || min === undefined || max === undefined) {
    return []
  }

  const definitions: ScoreDefinition[] = []
  for (let score = min; score <= max; score += 1) {
    const existing = existingDefinitions.find(d => Number(d.score) === score)
    definitions.push({
      score,
      definition: existing?.definition || '',
    })
  }
  return definitions
}
