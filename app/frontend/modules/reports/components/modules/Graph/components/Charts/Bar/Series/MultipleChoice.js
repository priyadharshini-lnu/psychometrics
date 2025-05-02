import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'

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
    const colors = _.map(model.props.colors, 'color')
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
          return {
            name: model.props.choicesTexts[i] || label,
            y: data,
            drilldown: label,
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
