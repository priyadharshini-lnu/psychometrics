import _ from 'lodash'
import moment from 'moment'
import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'
import Selectors from './Selectors'
import Values from './Values'

const Custom = function (condition, questions = {}, results = {}, result = null) {
  this.condition = condition
  this.subject = condition.subject
  this.question = _.find(questions, { id: this.subject })
  this.prefix = condition.prefix
  this.answer = condition.answer
  this.predicate = condition.predicate
  this.type = condition.type
  this.value = condition.value
  this.result = result
  this.results = results
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
    this.result = this.results[this.subject]

    if (!this.result) {
      if (this.predicate === 'Empty') {
        return { prefix: this.prefix || 'Or', value: true }
      }
      return { prefix: 'Or', value: false }
    }
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
        return !!_.find(this.question.choicesIds, this.answer)
    }
  },

  NotDisplayed () {
    switch (this.question.type) {
      case 'HotSpot':
        return true
      default:
        return !_.find(this.question.choicesIds, this.answer)
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
    return this.resultValue() < +this.value
  },

  LessThenOrEqual () {
    return this.resultValue() <= +this.value
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
    const result = this.resultValue()
    return result && result.toString().search(this.value) === -1
  },

  MatchesRegexp () {
    const result = this.resultValue()
    return result && result.toString().match(new RegExp(this.value))
  },

  NotInPast () {
    const result = this.resultValue()
    if (!result) { return true }
    const format = this.question.props.type === 'Form'
      ? this.question.props.formTypes[this.answer].dateFormat
      : this.question.props.dateFormat
    const date = moment(result, format)
    const now = this.currentDateForFormat(format)
    return now <= date
  },

  NotInFuture () {
    const result = this.resultValue()
    if (!result) { return true }
    const format = this.question.props.type === 'Form'
      ? this.question.props.formTypes[this.answer].dateFormat
      : this.question.props.dateFormat

    const date = moment(result, format)
    const now = this.currentDateForFormat(format)
    return now >= date
  },

  currentDateForFormat (format) {
    let now = moment()
    const picker = DATE_FORMAT_OPTIONS.find(
      dateFormatOption => dateFormatOption.value === format,
    )?.picker ?? 'date'

    if (picker === 'date') {
      now = now.startOf('day')
    } else if (picker === 'month') {
      now = now.startOf('month')
    } else if (picker === 'year') {
      now = now.startOf('year')
    }
    return now
  },
})

export default Custom
