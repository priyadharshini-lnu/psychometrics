import _ from 'lodash'

const TextEntry = function (result) {
  this.result = result
  this.fillAnswers()
  if (this.result.question.props.type === 'Form') {
    this.result.answers = _.map(this.result.answers, (object, index) => {
      if (!_.includes(this.result.question.choicesIds, index)) {
        object.value = ''
      }
      return object
    })
  }
}

_.extend(TextEntry.prototype, {
  answer (...args) {
    this[this.result.question.props.type](...args)
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    if (this.result.question.props.type === 'Form') {
      return _.compact(_.map(this.result.answers, 'value')).length === this.result.question.props.choices
    }
    return _.compact(_.map(this.result.answers, 'value')).length
  },

  fillAnswers () {
    _.times(this.result.question.props.choices, (i) => {
      if (!this.result.answers[i]) {
        this.result.answers.push({ value: '' })
      }
    })
  },

  SingleLine (index) {
    this.result.answers = [{ value: index }]
  },

  MultiLine (index) {
    this.result.answers = [{ value: index }]
  },

  Password (index) {
    this.result.answers = [{ value: index }]
  },

  EssayTextBox (index) {
    this.result.answers = [{ value: index }]
  },

  SelectBox (index) {
    this.result.answers = [{ value: index }]
  },

  Form (index, value) {
    this.result.answers[index] = { index, value }
  },
})

export default TextEntry
