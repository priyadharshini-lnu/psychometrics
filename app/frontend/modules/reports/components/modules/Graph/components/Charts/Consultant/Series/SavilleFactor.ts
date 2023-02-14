import AppStore from 'modules/reports/store/AppStore'
import { getSavilleFactorsScore } from 'modules/reports/commands/getSavilleFactorsScore'
import { SavilleScore } from 'modules/reports/models/Result'
import Module from 'modules/reports/core/interfaces/Module'

type SavilleResults = {
  externalScoring: SavilleScore[]
}

export const Functions = {
}

export default {
  series (results: SavilleResults, factorId: string, model: Module) {
    const scores = getSavilleFactorsScore({
      scoreType: model.getScoreType(),
      valueType: model.getValueType(),
      scores: results.externalScoring,
      assessmentId: model.assessment_id,
      allFactors: AppStore.getAssessmentById(model.assessment_id).factors,
      scoreForFactorIds: [factorId],
    })

    return { y: scores?.length ? scores[0].score : null }
  },
  functions: Object.keys(Functions),
}
