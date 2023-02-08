import map from 'lodash/map'
import AppStore from '~/modules/reports/store/AppStore'
import { getSavilleFactorsScore } from '~/modules/reports/commands/getSavilleFactorsScore'
import Result, { SavilleScore } from '~/modules/reports/models/Result'
import Module from '~/modules/reports/core/interfaces/Module'

type SavilleResults = {
  desc: string,
  filterId: string,
  results: Result<SavilleScore[]>
}

export const Functions = {
}

export default {
  series (results: SavilleResults[], factorIds: string[], model: Module) {
    const scoreType = model.getScoreType()
    const valueType = model.getValueType()
    const colors = map(model.props.colors, 'color')
    const assessment = AppStore.getAssessmentById(model.assessment_id)

    return results.map((res, i) => {
      const scores = getSavilleFactorsScore({
        scoreType,
        valueType,
        scores: res.results.externalScoring,
        assessmentId: model.assessment_id,
        allFactors: assessment.factors,
        scoreForFactorIds: factorIds,
        scoreKey: 'y',
      })
      return {
        name: AppStore.report.getFilterNameById(res.filterId),
        color: colors[i],
        data: scores,
      }
    })
  },
  hasLegend: true,
  functions: Object.keys(Functions),
}
