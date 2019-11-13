import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'

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
    const commonData = _.map(question.props.choicesTexts, (label, i) => {
      label = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
      const data = (Functions[func] || Functions.Mean)(results.questions[question.id], i)
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
