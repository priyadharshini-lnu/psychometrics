/* eslint-disable prefer-spread */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Validations from 'models/Validations'
import I18nStore from 'store/I18nStore'
import PreviewStore from 'store/AssessmentPreviewStore'
import LocalStorage from 'utils/LocalStorage'
import rstore from 'store'
import Results from './Results'

const Result = function (question, answers = null, notApplicable = null) {
  this.questionId = question.id
  this.question = question
  const Res = Results[question.type] || function () {}
  // this.moduleResult = new Results[question.type](this)
  this.answers = _.cloneDeep(answers || question.props.defaultValues) || []
  this.notApplicable = notApplicable
  this.moduleResult = new Res(this)
}

Result.prototype = new EventEmitter()

_.extend(Result.prototype, {

  validate () {
    const errors = []
    if (_.isBoolean(this.notApplicable) && this.notApplicable) {
      return errors
    }

    if (this.question.requiredValidation
      && this.question.requiredValidation.enabled
      && this.question.requiredValidation.type === 'Force') {
      if (!this.moduleResult.requiredValidation()) {
        if (this.moduleResult.videoResponse) {
          errors.push({ type: 'forceRequired', message: I18nStore.t('validations.please_record_and_save_video_first') })
        } else {
          errors.push({ type: 'forceRequired', message: I18nStore.t('validations.please_answer_question') })
        }
      }
    }

    const res = this.processValidation()

    if (res) {
      errors.push(res)
    }

    return errors
  },

  processValidation () {
    if (this.question.validation.type === 'None') {
      return
    }

    if (this.question.validation.type === 'Custom') {
      return this.processCustomValidation()
    }

    const Validation = Validations[this.question.validation.type]
    if (!Validation) {
      throw new Error(`Undefined Validation Type ${this.question.validation.type}`)
    }
    const validation = new Validation(this.question.validation.args, this.question)
    return validation.validate(this.moduleResult.results())
  },

  processCustomValidation () {
    const message = I18nStore.tCustomValidation(this.question)
    const { conditions } = this.question.validation.args

    const validations = _.map(conditions, condition => new Validations.Custom(condition))

    const results = validations.map(validation => validation.validate(this))

    let res = null
    let prev = null
    _.each(results, (result) => {
      if (prev) {
        if (result.prefix === 'And') {
          res = res && result.value
        }

        if (result.prefix === 'Or') {
          res = res || result.value
        }
      } else {
        res = result.value
      }
      prev = result
    })

    if (!res) {
      return { type: 'Custom', message }
    }
  },

  answer (...args) {
    this.moduleResult.answer.apply(this.moduleResult, args)
    if (!PreviewStore.flow) { return }
    const pageResults = PreviewStore.flow.currentPage().results().reduce((res, current) => ({
      ...res,
      [current.question.id]: current.toJSON(),
    }), {})

    LocalStorage.setIn(PreviewStore.resultLocalStorageKey, pageResults)
    // TODO (atanych): we have confused component updating engine. It will create problems at the most inconvenient time
    // TODO (atanych): Redux forever
    rstore.dispatch({ type: 'flow_processor/ANSWER', result: this.toJSON() })
    PreviewStore.update()
  },

  isEmpty () {
    if (_.isEmpty(this.answers)) { return true }
    if (this.question.type === 'ConstantSum') {
      return _.every(this.answers, answer => [null, undefined, '', 0].includes(answer.value))
    }
    if (this.question.type === 'SideBySide') {
      return false
    }
    if (this.question.type === 'GapAnalysis') {
      return false
    }
    return _.every(this.answers, answer => [null, undefined, ''].includes(answer.value))
  },

  toJSON () {
    return {
      question_id: this.question.id,
      answers: this.answers,
      not_applicable: this.notApplicable,
    }
  },
})

export default Result
