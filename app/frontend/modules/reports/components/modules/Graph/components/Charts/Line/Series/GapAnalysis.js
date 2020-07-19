import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions } from '../../Base/Series/GapAnalysis'

export default {
  series (results, question, model, func = 'Count') {
    const data = _.map(question.props.choicesTexts, (label, i) => (
      Functions[func] || Functions.Count)(results.questions[question.id], i))
    return [{
      data,
    }]
  },

  xAxis (question, model) {
    const labels = _.map(question.props.choicesTexts, (label, i) => {
      label = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
      return model.props.choicesTexts[i] || label
    })
    return {
      categories: labels,
    }
  },

  functions (question) {
    return _.keys(Functions[question.type])
  },
}
