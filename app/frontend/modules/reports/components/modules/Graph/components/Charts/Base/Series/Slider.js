import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'

export const Functions = {
  Count (data) {
    return data.length
  },

  Mean (data, index) {
    let results = 0
    _.each(data, (result) => {
      const userResult = _.find(result, { index }) || { value: 0 }
      results += userResult.value
    })
    return results / data.length
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
}
