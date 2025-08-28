import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

export const Functions = {
  Mean (data, choice) {
    let results = 0
    _.each(data, (result) => {
      const object = _.find(result, { choice })
      if (object) {
        results += object.scale + 1
      }
    })
    return results / data.length
  },
}

export default {
  series (results, question, model, func = 'Mean') {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? _.map(model.props.colors, 'color') : []
    if (Array.isArray(results)) {
      return _.map(results, (res, i) => {
        const commonData = _.map(question.props.choicesTexts, (label, i) => {
          label = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
          const data = (Functions[func] || Functions.Mean)(res.results.questions[question.id], i)
          const barColor = useColorsFromGraphValueConditions
            ? getColorForGraphValue(model.props.graphValueConditions, data) : undefined
          return {
            name: model.props.choicesTexts[i] || label,
            y: data,
            drilldown: label,
            color: barColor,
          }
        })
        return {
          name: res.desc || AppStore.report.getFilterNameById(res.filterId),
          color: colors[i],
          data: commonData,
        }
      })
    }
    throw new Error('Bar chart supports multiple choices. See ResultManager to build correct array of results')
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
