import _ from 'lodash'
import store from 'store/AssessmentPreviewStore'
import BaseResolver from './BaseResolver'
import Selectors from '../../Validations/Selectors'
import Values from '../../Validations/Values'

export default class QuestionResolver extends BaseResolver {
  constructor (condition) {
    super()
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

  resolve (resulsts = store.results) {
    if (!this.question || !this.predicate) { return false }
    this.result = store.results[this.question.id]

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
        return !!_.find(this.result.question.choicesIds, this.answer)
    }
  }

  NotDisplayed () {
    switch (this.question.type) {
      case 'HotSpot':
        return true
      default:
        return !_.find(this.result.question.choicesIds, this.answer)
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

  MatchesRegexp = () => this.resultValue().toString().test(new RegExp(this.value))
}
