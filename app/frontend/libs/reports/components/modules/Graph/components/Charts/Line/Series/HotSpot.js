import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions, Formats, VALUES } from '../../Base/Series/HotSpot'

export default {
  series (results, question, model, func = 'Count') {
    const result = []
    _.forOwn(VALUES, (value, type) => {
      const data = {}
      data.data = _.map(question.props.regions,
        (region, index) => (Functions[func] || Functions.Count)(results.questions[question.id], index, value))
      data.name = type
      result.push(data)
    })
    return result
  },

  xAxis (question, model) {
    const labels = _.map(question.props.regionsNames, (label, i) => {
      label = I18nStore.tQuestion(question, `regionsNames${i + 1}`, { region: i })
      return model.props.choicesTexts[i] || label
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
