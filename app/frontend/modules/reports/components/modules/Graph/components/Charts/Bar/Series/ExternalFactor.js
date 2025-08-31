import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import Factors from '~/modules/reports/commands/Factors'
import I18nStore from '~/modules/reports/store/I18nStore'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const sourceType = _.get(model, 'props.source.type')
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? _.map(model.props.colors, 'color') : []
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const factorsByIdAndType = _.keyBy(assessment.factors, f => `${f.id}/${f.type}`)
    return results.map((res, i) => {
      const data = (model.props.source.factors || []).map((f) => {
        const y = Factors.LookupValue.call(res.results.externalScoring, sourceType, f)
        const barColor = useColorsFromGraphValueConditions
          ? getColorForGraphValue(model.props.graphValueConditions, y) : undefined
        return ({
          name: I18nStore.tExternalFactorName(model.assessment_id, _.get(factorsByIdAndType, `${f}/${sourceType}`, f)),
          y,
          color: barColor,
        })
      })
      return {
        name: res.desc || AppStore.report.getFilterNameById(res.filterId),
        color: colors[i],
        data,
      }
    })
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
