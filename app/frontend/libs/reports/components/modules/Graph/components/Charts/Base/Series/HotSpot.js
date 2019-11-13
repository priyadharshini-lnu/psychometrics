import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'

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
  series (results, question, model, func = 'Count') {
    const result = []
    _.forOwn(VALUES, (value, type) => {
      const typeResult = {
        name: type,
      }
      typeResult.data = _.map(question.props.regions, (region, index) => ({
        name: model.props.choicesTexts[index]
          || I18nStore.tQuestion(question, `regionsNames${index + 1}`, { region: index }),
        y: (Functions[func] || Functions.Count)(results.questions[question.id], index, value),
      }))
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
