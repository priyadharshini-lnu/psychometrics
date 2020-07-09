import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions, Formats } from '../../Base/Series/PickGroupRank'

export default {
  series (results, question, model, func = 'Count') {
    return _.map(question.props.scalePointsTexts, (labelScalePoint, indexScalePoint) => {
      const data = _.map(question.props.choicesTexts,
        (labelChoice, indexChoice) => Functions[func](results.questions[question.id], indexChoice, indexScalePoint))
      return {
        data,
        name: labelScalePoint,
      }
    })
  },

  xAxis (question, model) {
    const labels = _.map(question.props.choicesTexts, (labelChoice, i) => {
      labelChoice = I18nStore.tQuestion(question, `choicesTexts${i + 1}`, { choice: i })
      return model.props.choicesTexts[i] || labelChoice
    })
    return {
      categories: labels,
    }
  },

  format (func = 'Count') {
    return Formats[func]
  },

  hasLegend: true,

  functions: _.keys(Functions),
}
