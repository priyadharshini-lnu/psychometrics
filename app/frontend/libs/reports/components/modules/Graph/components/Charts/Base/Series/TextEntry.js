import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'

export const Functions = {
  Count (data) {
    return data.length
  },
}
export default {
  series (results, question, model, func = 'Count') {
    const data = Functions[func](results.questions[question.id])
    return [{
      colorByPoint: true,
      data: [{
        name: I18nStore.tQuestion(question, 'questionText'),
        y: data,
        drilldown: 'Count',
      }],
    }]
  },
  functions: _.keys(Functions),
}
