import _ from 'lodash'
import I18nStore from '~/modules/reports/store/I18nStore'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

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
  series (res, question, model, func = 'Count') {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const { results } = res[0]
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
        const y = func(results.questions[question.id], indexChoice, indexScalePoint)
        return {
          name: model.props.choicesTexts[indexChoice] || labelChoice,
          y,
          color: useColorsFromGraphValueConditions
            ? getColorForGraphValue(model.props.graphValueConditions, y) : undefined,
        }
      })
      result.push(typeResult)
    })
    return result
  },

  hasLegend: true,

  functions: _.keys(Functions),
}
