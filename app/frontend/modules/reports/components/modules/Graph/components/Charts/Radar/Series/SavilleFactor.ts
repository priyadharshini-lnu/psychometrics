import AppStore from 'modules/reports/store/AppStore'
import { getSavilleFactorsScore } from 'modules/reports/commands/getSavilleFactorsScore'
import Result, { SavilleScore } from 'modules/reports/models/Result'
import Module from 'modules/reports/core/interfaces/Module'

type SavilleResults = {
  results: Result<SavilleScore[]>
}

export const Functions = {}

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

    return [{
      data: scores.map(score => score.score),
      name: 'All Responses',
    }]
  },
  functions: Object.keys(Functions),
}
