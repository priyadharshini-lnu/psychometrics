import round from 'lodash/round'
import AppStore from '~/modules/reports/store/AppStore'
import { getSavilleFactorsScore } from '~/modules/reports/commands/getSavilleFactorsScore'
import Result, { SavilleScore } from '~/modules/reports/models/Result'
import Module from '~/modules/reports/core/interfaces/Module'

type SavilleResults = {
  results: Result<SavilleScore[]>
}

export const Functions = {
}

const MAX_SCORING_VALUE = 6
export default {
  series (results: SavilleResults[], factorIds: string[], model: Module) {
    const scores = getSavilleFactorsScore({
      scoreType: model.getScoreType(),
      valueType: model.getValueType(),
      scores: results[0].results.externalScoring,
      assessmentId: model.assessment_id,
      allFactors: AppStore.getAssessmentById(model.assessment_id).factors,
      scoreForFactorIds: factorIds,
    })

    return scores.map(score => round(score.score * 100 / MAX_SCORING_VALUE, 1))
  },
  functions: Object.keys(Functions),
}
