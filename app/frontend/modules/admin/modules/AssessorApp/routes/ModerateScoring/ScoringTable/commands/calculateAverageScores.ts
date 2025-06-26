import { Factor, Score } from '~/modules/admin/modules/campaigns/core/combinedScoring'

export const calculateAverageScores = (
  columnsData: Factor[],
  evaluatorsData: Score[],
): Record<string, number | string> => {
  const averages: Record<string, string> = {}
  columnsData.forEach((factor) => {
    let total = 0
    let count = 0
    evaluatorsData.forEach((evaluator) => {
      const score = evaluator.scores[factor.factorId]
      if (score !== undefined && score !== null) {
        total += score
        count += 1
      }
    })
    averages[factor.factorId] = count > 0 ? (total / count).toFixed(2) : '-'
  })
  return averages
}
