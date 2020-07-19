import _ from 'lodash'
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
    const commonData = _.map(question.props.choicesTexts, (label, i) => {
      const data = Functions[func](results.questions[question.id], i)
      label = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
      return {
        name: model.props.choicesTexts[i] || label,
        y: data,
        drilldown: label,
      }
    })
    return [{
      colorByPoint: true,
      data: commonData,
    }]
  },
  functions: _.keys(Functions),
  collection: 'choicesTexts',
}
