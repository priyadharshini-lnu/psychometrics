import map from 'lodash/map'
import AppStore from '~/modules/reports/store/AppStore'
import { getSavilleFactorsScore } from '~/modules/reports/commands/getSavilleFactorsScore'
import Result, { SavilleScore } from '~/modules/reports/models/Result'
import Module from '~/modules/reports/core/interfaces/Module'
import { TextCondition } from '~/modules/reports/interfaces/graphs/Bar'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

type SavilleResults = {
  desc: string,
  filterId: string,
  results: Result<SavilleScore[]>
}

type Model = Omit<Module, 'props'> & {
  props: Module['props'] & TextCondition
}

export const Functions = {
}

export default {
  series (results: SavilleResults[], factorIds: string[], model: Model) {
    const scoreType = model.getScoreType()
    const valueType = model.getValueType()
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? map(model.props.colors, 'color') : []
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
        addBarColor: value => getColorForGraphValue(model.props.graphValueConditions, value),
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
