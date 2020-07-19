import _ from 'lodash'
import { Functions as Slider } from '../../Base/Series/Slider'
import { Functions as ConstantSum } from '../../Base/Series/ConstantSum'
import { Functions as MultipleChoice } from '../../Base/Series/MultipleChoice'
import { Functions as RankOrder } from '../../Base/Series/RankOrder'

const Functions = {
  ConstantSum,
  RankOrder,
  MultipleChoice,
  Slider,
}

export default {
  series (results, question, model, func = 'Count') {
    const data = _.map(question.props.choicesTexts,
      (label, i) => _.invoke(Functions, [question.type, func], results.questions[question.id], i))
    return [{
      data,
    }]
  },

  xAxis (question, model) {
    const labels = _.map(question.props.choicesTexts, (label, i) => model.props.choicesTexts[i] || label)
    return {
      categories: labels,
    }
  },

  functions (question) {
    return _.keys(Functions[question.type])
  },
}
