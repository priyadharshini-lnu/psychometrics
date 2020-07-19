import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions } from '../../Base/Series/MatrixTable'

export default {
  series (results, question, model, func = 'Count') {
    return _.map(question.props.scalePointsTexts, (labelScalePoint, indexScalePoint) => {
      const data = _.map(
        question.props.choicesTexts, (_, indexChoice) => (
          Functions[func] || Functions.Count
        )(results.questions[question.id], indexChoice, indexScalePoint),
      )
      labelScalePoint = I18nStore.tQuestion(
        question, `scalePointsTexts${indexScalePoint + 1}`, { scale: indexScalePoint },
      )
      return {
        data,
        name: labelScalePoint,
      }
    })
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

  hasLegend: true,

  functions: _.keys(Functions),
}
