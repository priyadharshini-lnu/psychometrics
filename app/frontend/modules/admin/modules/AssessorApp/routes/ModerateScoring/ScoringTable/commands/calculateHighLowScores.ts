import { EMPTY_SCORE_INDICATOR } from '~/modules/admin/constants/strings'
import { Factor, Score } from '~/modules/admin/modules/campaigns/core/combinedScoring'

export const calculateHighLowScores = (
  columnsData: Factor[],
  evaluatorsData: Score[],
): Record<string, { high: string, low: string }> => {
  const highLows: Record<string, { high: string, low: string }> = {}
  columnsData.forEach((factor) => {
    let high = -Infinity
    let low = Infinity
    evaluatorsData.forEach((evaluator) => {
      const score = evaluator.scores[factor.factorId]
      if (score !== undefined && score !== null) {
        high = Math.max(high, score)
        low = Math.min(low, score)
      }
    })
    highLows[factor.factorId] = {
      high: high === -Infinity ? EMPTY_SCORE_INDICATOR : high.toString(),
      low: low === Infinity ? EMPTY_SCORE_INDICATOR : low.toString(),
    }
  })
  return highLows
}
