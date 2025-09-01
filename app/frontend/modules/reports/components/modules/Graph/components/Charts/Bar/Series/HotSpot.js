import _ from 'lodash'
import I18nStore from '~/modules/reports/store/I18nStore'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

export const Functions = {
  Count (data, regionId, resultValue) {
    let results = 0
    _.each(data, (result) => {
      if (_.some(result, { region: regionId, value: resultValue })) {
        results += 1
      }
    })
    return results
  },

  Percentile (data, regionId, resultValue) {
    let results = 0
    _.each(data, (result) => {
      if (_.some(result, { region: regionId, value: resultValue })) {
        results += 1
      }
    })
    return results * 100 / data.length
  },
}

export const Formats = {
  Count: '{point.y}',
  Percentile: '{point.y:.1f}%',
}

export const VALUES = {
  dislike: false,
  neutral: null,
  like: true,
}
export default {
  series (res, question, model, func = 'Count') {
    const { results } = res[0]
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const result = []
    _.forOwn(VALUES, (value, type) => {
      const typeResult = {
        name: type,
      }
      func = Functions[func] ? Functions[func] : Functions.Count
      typeResult.data = _.map(question.props.regions, (region, index) => {
        const y = func(results.questions[question.id], index, value)
        return ({
          name: model.props.choicesTexts[index]
          || I18nStore.tQuestion(question, `regionsNames${index + 1}`, { region: index }),
          y,
          color: useColorsFromGraphValueConditions
            ? getColorForGraphValue(model.props.graphValueConditions, y) : undefined,
        })
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
