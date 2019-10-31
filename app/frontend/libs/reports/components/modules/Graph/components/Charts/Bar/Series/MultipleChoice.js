import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'

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
    if (Array.isArray(results)) {
      func = Functions[func] ? Functions[func] : Functions.Count
      return _.map(results, (res, i) => {
        const commonData = _.map(question.props.choicesTexts, (label, i) => {
          label = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
          const data = func(res.results.questions[question.id], i)
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
