import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'

export const Functions = {
  Count (data, indexChoice, indexScalePoint) {
    let results = 0
    _.each(data, (result) => {
      if (_.some(result, { choice: indexChoice, scale: indexScalePoint })) {
        results += 1
      }
    })
    return results
  },
}

export default {
  series (results, question, model, func = 'Count') {
    const result = []
    _.map(question.props.scalePointsTexts, (labelScalePoint, indexScalePoint) => {
      labelScalePoint = I18nStore.tQuestion(
        question, `scalePointsTexts${indexScalePoint + 1}`, { scale: indexScalePoint },
      )
      const typeResult = {
        name: labelScalePoint,
      }
      func = Functions[func] ? Functions[func] : Functions.Count
      typeResult.data = _.map(question.props.choicesTexts, (labelChoice, indexChoice) => {
        labelChoice = I18nStore.tQuestion(question, `choicesTexts${indexChoice + 1}`, { choice: indexChoice })
        return {
          name: model.props.choicesTexts[indexChoice] || labelChoice,
          y: func(results.questions[question.id], indexChoice, indexScalePoint),
        }
      })
      result.push(typeResult)
    })
    return result
  },

  hasLegend: true,

  functions: _.keys(Functions),
}
