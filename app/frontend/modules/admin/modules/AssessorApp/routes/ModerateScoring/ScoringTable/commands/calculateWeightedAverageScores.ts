import { EMPTY_SCORE_INDICATOR } from '~/modules/admin/constants/string'
import { Factor, Score, Weightage } from '~/modules/admin/modules/campaigns/core/combinedScoring'

export const calculateWeightedAverageScores = (
  columnsData: Factor[],
  evaluatorsData: Score[],
  FactorWeightagesData: Weightage[],
): Record<string, number | string> => {
  if (FactorWeightagesData.length === 0 || columnsData.length === 0 || evaluatorsData.length === 0) return {}
  const factorWeightMap: Record<string, number> = FactorWeightagesData.reduce((map, weightage) => {
    map[`${weightage.factor.id}${weightage.assessment.id}`] = weightage.weight
    return map
  }, {})
  const weightedAverages: Record<string, number | string> = {}
  columnsData.forEach((factor) => {
    let totalWeightedScore = 0
    let count = 0
    evaluatorsData.forEach((evaluator) => {
      const score = evaluator.scores[factor.factorId]
      const weight = factorWeightMap[`${factor.factorId}${evaluator.assessment.id}`] || 1
      if (score !== undefined && score !== null) {
        totalWeightedScore += score * weight
        count += 1
      }
    })
    weightedAverages[factor.factorId] = count > 0 ? (totalWeightedScore / count).toFixed(2) : EMPTY_SCORE_INDICATOR
  })
  return weightedAverages
}
