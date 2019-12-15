/* eslint-disable prefer-spread */
import _ from 'lodash'
import Utils from 'utils'

const ConstantSum = function (result) {
  this.result = result
  this.result.answers = _.filter(this.result.answers,
    answer => _.includes(this.result.question.choicesIds, parseInt(answer.index, 10)))
  _.times(this.result.question.props.choices, (i) => {
    if (!_.find(this.result.answers, { index: i })) {
      this.result.answers.push({ index: i, value: 0 })
    }
  })
}

_.extend(ConstantSum.prototype, {
  answer (...args) {
    this[this.result.question.props.type].apply(this, args)
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return this.result.answers.length
  },

  Slider (index, value, precision) {
    const object = _.find(this.result.answers, { index })
    if (object) {
      object.value = Utils.round(value, precision)
    } else {
      this.result.answers.push({ index, value: Utils.round(value, precision) })
    }
  },

  Bar (index, value, precision) {
    const object = _.find(this.result.answers, { index })
    if (object) {
      object.value = Utils.round(value, precision)
    } else {
      this.result.answers.push({ index, value: Utils.round(value, precision) })
    }
  },

  Choice (index, value) {
    const object = _.find(this.result.answers, { index })
    if (object) {
      object.value = value
    } else {
      this.result.answers.push({ index, value })
    }
  },
})

export default ConstantSum
