import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

export const Functions = {
  Count (data) {
    return data.length
  },
}
export default {
  series (results, question, model, func = 'Count') {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? _.map(model.props.colors, 'color') : []
    if (Array.isArray(results)) {
      return _.map(results, (res, i) => {
        func = Functions[func] ? Functions[func] : Functions.Count
        const data = func(res.results.questions[question.id])
        const barColor = useColorsFromGraphValueConditions
          ? getColorForGraphValue(model.props.graphValueConditions, data) : undefined
        return {
          name: res.desc || AppStore.report.getFilterNameById(res.filterId),
          color: colors[i],
          data: [{
            name: I18nStore.tQuestion(question, 'questionText'),
            y: data,
            drilldown: 'Count',
            color: barColor,
          }],
        }
      })
    }
    throw new Error('Bar chart supports multiple choices. See ResultManager to build correct array of results')
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
