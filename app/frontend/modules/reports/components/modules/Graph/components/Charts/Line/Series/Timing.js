import _ from 'lodash'
import { Functions, TYPES } from '../../Base/Series/Timing'

export default {
  series (results, question, model, func = 'Mean') {
    const result = _.map(TYPES, (label, key) => Functions[func](results.questions[question.id], key))
    return [{
      data: result,
    }]
  },

  xAxis (question, model) {
    const labels = _.map(TYPES, (label, i) => model.props.choicesTexts[i] || label)
    return {
      categories: labels,
    }
  },

  functions: _.keys(Functions),
}
