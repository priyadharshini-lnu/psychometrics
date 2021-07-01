import AppStore from 'modules/reports/store/AppStore'
import LookupSourceName from 'modules/reports/commands/LookupSourceName'
import { getSavilleFactorsScore } from 'modules/reports/commands/getSavilleFactorsScore'
import { SavilleScore } from 'modules/reports/models/Result'
import Module from 'modules/reports/core/interfaces/Module'
import { Functions } from '../../Base/Series/Factor'

type SavilleResults = {
  externalScoring: SavilleScore[]
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

    return [{ data: scores.map(score => score.score) }]
  },

  xAxis (factorIds: string[], model) {
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const labels = factorIds.map(factorId => LookupSourceName.call(assessment, factorId, model.getSourceType()))
    return {
      categories: labels,
    }
  },

  functions: Object.keys(Functions),
}
