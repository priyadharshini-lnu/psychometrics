import _ from 'lodash'
import BaseResolver from './BaseResolver'
import Selectors from '../../Validations/Selectors'
import Values from '../../Validations/Values'

export default class QuestionResolver extends BaseResolver {
  constructor (condition, context) {
    super()
    this.condition = condition
    this.subject = condition.subject
    this.question = _.find(context.questions, { id: this.subject })
    this.prefix = condition.prefix
    this.answer = condition.answer
    this.predicate = condition.predicate
    this.type = condition.type
    this.value = condition.value
    this.result = null
  }

  resolve (results) {
    if (!this.question || !this.predicate) { return false }
    this.result = results[this.question.id]

    return this[this.predicate]()
  }

  isSelected () {
    const qType = this.question.type
    const mType = this.question.props.type || 'Main'

    const result = Selectors[qType][mType]
    return result(this)
  }

  resultValue () {
    const qType = this.question.type
    const mType = this.question.props.type || 'Main'

    const comparator = Values[qType][mType]
    return comparator(this)
  }

  Selected () {
    return !!this.isSelected()
  }

  NotSelected () {
    return !this.isSelected()
  }

  Displayed () {
    switch (this.question.type) {
      case 'HotSpot':
        return true
      default:
        return this.question.choicesIds.includes(parseInt(this.answer, 10))
    }
  }

  NotDisplayed () {
    switch (this.question.type) {
      case 'HotSpot':
        return true
      default:
        return !this.question.choicesIds.includes(parseInt(this.answer, 10))
    }
  }

  EqualTo () {
    const res = this.resultValue()
    if (_.isNumber(res)) {
      return +this.value === res
    }
    return this.value === res
  }

  NotEqualTo () {
    const res = this.resultValue()
    if (_.isNumber(res)) {
      return +this.value !== res
    }
    return this.value !== res
  }

  GreaterThen = () => this.resultValue() > +this.value

  GreaterThenOrEqual = () => this.resultValue() >= +this.value

  LessThen = () => this.resultValue() > +this.value

  LessThenOrEqual = () => this.resultValue() >= +this.value

  Empty = () => !this.resultValue()

  NotEmpty = () => !!this.resultValue()

  Contains = () => this.resultValue().toString().search(this.value) >= 0

  DoesNotContains = () => this.resultValue().toString().search(this.value) === -1

  MatchesRegexp = () => this.resultValue().toString().match(new RegExp(this.value))
}
