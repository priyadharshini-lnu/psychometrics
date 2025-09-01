import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

export const Functions = {
  Count (data, index) {
    let results = 0
    _.each(data, (result) => {
      if (_.some(result, { index, value: true })) {
        results += 1
      }
    })
    return results
  },

  Percentile (data, index) {
    let results = 0
    let length = 0
    _.each(data, (result) => {
      if (_.some(result, { index, value: true })) {
        results += 1
      }
      length += result.length
    })
    return results * 100 / length
  },
}

export default {
  series (results, question, model, func = 'Count') {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? _.map(model.props.colors, 'color') : []
    const resultsData = model.props.hideEmptyFilters
      ? results.filter((r) => {
        const v = r.results.scoring
        return !!(typeof v !== 'object' || Object.keys(v).length)
      }) : results
    if (Array.isArray(resultsData)) {
      func = Functions[func] ? Functions[func] : Functions.Count
      return _.map(resultsData, (res, i) => {
        const commonData = _.map(question.props.choicesTexts, (label, i) => {
          label = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
          const data = func(res.results.questions?.[question.id], i)
          const barColor = useColorsFromGraphValueConditions
            ? getColorForGraphValue(model.props.graphValueConditions, data)
            : undefined
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
  collection: 'choicesTexts',
}
