import sumBy from 'lodash/sumBy'
import round from 'lodash/round'
import AppStore from '~/modules/reports/store/AppStore'
import { getSavilleFactorsScore } from '~/modules/reports/commands/getSavilleFactorsScore'
import { SavilleScore } from '~/modules/reports/models/Result'
import Module from '~/modules/reports/core/interfaces/Module'

type SavilleResults = {
  externalScoring: SavilleScore[]
}

export const Functions = {
}

export default {
  series (results: SavilleResults, factorIds: string[], model: Module) {
    const scores = getSavilleFactorsScore({
      scoreType: model.getScoreType(),
      valueType: model.getValueType(),
      scores: results.externalScoring,
      assessmentId: model.assessment_id,
      allFactors: AppStore.getAssessmentById(model.assessment_id).factors,
      scoreForFactorIds: factorIds,
    })
    const total = sumBy(scores, 'score')
    let currentValue = 0

    return scores.map((score) => {
      const result = {
        from: currentValue,
        to: currentValue + round(score.score * 100 / total, 1),
      }
      currentValue = result.to
      return result
    })
  },
  functions: Object.keys(Functions),
}
