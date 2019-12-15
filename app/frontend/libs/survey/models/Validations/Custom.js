import _ from 'lodash'
import store from 'store/AssessmentPreviewStore'
import Selectors from './Selectors'
import Values from './Values'

const Custom = function (condition) {
  this.condition = condition
  this.subject = condition.subject
  this.question = _.find(store.allQuestions, { id: this.subject })
  this.prefix = condition.prefix
  this.answer = condition.answer
  this.predicate = condition.predicate
  this.type = condition.type
  this.value = condition.value
  this.result = null
}

_.extend(Custom.prototype, {

  isSelected () {
    const qType = this.question.type
    const mType = this.question.props.type || 'Main'

    const result = Selectors[qType][mType]
    return result(this)
  },

  resultValue () {
    const qType = this.question.type
    const mType = this.question.props.type || 'Main'

    const comparator = Values[qType][mType]
    return comparator(this)
  },

  validate () {
    if (!this.question || !this.predicate) { return { prefix: 'Or', value: false } }
    this.result = store.results[this.question.id]
    return { prefix: this.prefix, value: this[this.predicate]() }
  },

  Selected () {
    return !!this.isSelected()
  },

  NotSelected () {
    return !this.isSelected()
  },

  Displayed () {
    switch (this.question.type) {
      case 'HotSpot':
        return true
      default:
        return !!_.find(this.result.question.choicesIds, this.answer)
    }
  },

  NotDisplayed () {
    switch (this.question.type) {
      case 'HotSpot':
        return true
      default:
        return !_.find(this.result.question.choicesIds, this.answer)
    }
  },

  EqualTo () {
    const res = this.resultValue()
    if (_.isNumber(res)) {
      return +this.value === res
    }
    return this.value === res
  },

  NotEqualTo () {
    const res = this.resultValue()
    if (_.isNumber(res)) {
      return +this.value !== res
    }
    return this.value !== res
  },

  GreaterThen () {
    return this.resultValue() > +this.value
  },

  GreaterThenOrEqual () {
    return this.resultValue() >= +this.value
  },

  LessThen () {
    return this.resultValue() > +this.value
  },

  LessThenOrEqual () {
    return this.resultValue() >= +this.value
  },

  Empty () {
    return !this.resultValue()
  },

  NotEmpty () {
    return !!this.resultValue()
  },

  Contains () {
    return this.resultValue().toString().search(this.value) >= 0
  },

  DoesNotContains () {
    return this.resultValue().toString().search(this.value) === -1
  },

  MatchesRegexp () {
    return this.resultValue().toString().test(new RegExp(this.value))
  },

})

export default Custom
