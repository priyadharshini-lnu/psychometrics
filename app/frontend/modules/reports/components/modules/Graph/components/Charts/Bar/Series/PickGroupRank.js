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

  Mean (data, indexChoice, indexScalePoint) {
    let results = 0
    _.each(data, (result) => {
      const userResult = _.find(result, { choice: indexChoice, scale: indexScalePoint }) || { value: 0 }
      results += userResult.value
    })
    return results / data.length
  },

  Percentile (data, indexChoice, indexScalePoint) {
    let results = 0
    _.each(data, (result) => {
      if (_.some(result, { choice: indexChoice, scale: indexScalePoint })) {
        results += 1
      }
    })
    return results * 100 / data.length
  },
}

export const Formats = {
  Count: '{point.y}',
  Mean: '{point.y:.1f}',
  Percentile: '{point.y:.1f}%',
}

export default {
  series (res, question, model, func = 'Count') {
    const { results } = res[0]
    const result = []

    _.map(question.props.scalePointsTexts, (labelScalePoint, indexScalePoint) => {
      labelScalePoint = I18nStore.tQuestion(
        question, `scalePointsTexts${indexScalePoint + 1}`, { scale: indexScalePoint },
      )
      const typeResult = {
        name: labelScalePoint,
      }
      typeResult.data = _.map(question.props.choicesTexts, (labelChoice, indexChoice) => {
        labelChoice = I18nStore.tQuestion(question, `choicesTexts${indexChoice + 1}`, { choice: indexChoice })
        return {
          name: model.props.choicesTexts[indexChoice] || labelChoice,
          y: (Functions[func] || Functions.Count)(results.questions[question.id], indexChoice, indexScalePoint),
        }
      })
      result.push(typeResult)
    })
    return result
  },

  format (func = 'Count') {
    return Formats[func]
  },

  hasLegend: true,

  functions: _.keys(Functions),
}
