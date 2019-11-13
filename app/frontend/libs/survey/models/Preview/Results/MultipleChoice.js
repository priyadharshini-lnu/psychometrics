/* eslint-disable prefer-spread */
import _ from 'lodash'

const MultipleChoice = function (result) {
  this.result = result
  _.remove(this.result.answers, value => !_.includes(this.result.question.choicesIds, parseInt(value.index, 10)))
}

_.extend(MultipleChoice.prototype, {
  answer (...args) {
    this[this.result.question.props.type].apply(this, args)
  },

  results () {
    _.remove(this.result.answers, { value: false })
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return this.result.answers.length
  },

  SingleAnswer (index) {
    this.result.answers = [{
      index,
      value: true,
    }]
  },

  MultipleAnswer (index, enable) {
    _.remove(this.result.answers, { index })
    if (enable) {
      this.result.answers.push({ index, value: enable })
    }
  },

  Dropdown (index) {
    this.result.answers = []
    if (index >= 0) {
      this.result.answers = [{
        index,
        value: true,
      }]
    }
  },

  SelectBox (index) {
    this.result.answers = []
    if (index >= 0) {
      this.result.answers = [{
        index,
        value: true,
      }]
    }
  },

  MultiSelectBox (index) {
    if (!_.remove(this.result.answers, { index }).length) {
      this.result.answers.push({ index, value: true })
    }
  },
})

export default MultipleChoice
