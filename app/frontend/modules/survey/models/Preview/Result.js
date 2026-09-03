/* eslint-disable prefer-spread */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Validations from '../Validations'
import { getStore, I18n } from '~/modules/survey/store/StoreWatchman'
import RequiredValidation from '../Validations/Required'
import { isEmailTextEntryQuestion } from '~/modules/survey/utils/question'
import Results from './Results'

const Result = function (question, answers = null, notApplicable = null, results = {},
  answeredQuestions = null, richTextEditorAnswerWordCount = 0) {
  this.questionId = question.id
  this.question = question
  this.answeredQuestions = answeredQuestions
  this.results = results
  const Res = Results[question.type] || function () {}
  // this.moduleResult = new Results[question.type](this)
  this.answers = _.cloneDeep(answers || question.props.defaultValues) || []
  this.notApplicable = notApplicable
  this.moduleResult = new Res(this)
  this.richTextEditorAnswerWordCount = richTextEditorAnswerWordCount
  this.dispatch = null
}

Result.prototype = new EventEmitter()

_.extend(Result.prototype, {

  validate () {
    let errors = []
    if (_.isBoolean(this.notApplicable) && this.notApplicable) {
      return errors
    }

    if (this.requiredValidationEnabled()) {
      const Validation = RequiredValidation[this.question.type] || RequiredValidation.Default
      errors = errors.concat(Validation.run(this.moduleResult))
    }

    const res = this.processValidation()

    if (res) {
      if (isEmailTextEntryQuestion(this.question)) { res.field = 'message' }
      errors.push(res)
    }

    return errors
  },

  requiredValidationEnabled () {
    return this.question.requiredValidation
      && this.question.requiredValidation.enabled
      && this.question.requiredValidation.type === 'Force'
  },

  processValidation () {
    if (this.question.validation.type === 'None' || !this.question.validation.type) {
      return
    }
    if (this.question.validation.type === 'Custom') {
      return _.find(
        _.map(this.question.validation.customValidations, validation => this.processCustomValidation(validation)),
        val => val,
      )
    }

    const Validation = Validations[this.question.validation.type]
    if (!Validation) {
      throw new Error(`Undefined Validation Type ${this.question.validation.type}`)
    }
    const validation = new Validation(this.question.validation.args, this.question)
    return validation.validate(this.moduleResult.results(), this.richTextEditorAnswerWordCount)
  },

  processCustomValidation (validation) {
    const message = I18n().tCustomValidation(this.question, validation.message, validation.uuid)
    if (!message) { return }
    const { conditions } = validation
    const validations = conditions.map(
      condition => new Validations.Custom(condition,
        this.answeredQuestions.length > 0 ? this.answeredQuestions : [this.question], this.results, this),
    )

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
    // const pageResults = PreviewStore.flow.currentPage().results().reduce((res, current) => ({
    //   ...res,
    //   [current.question.id]: current.toJSON(),
    // }), {})

    // LocalStorage.setIn(PreviewStore.resultLocalStorageKey, pageResults)
    // TODO (atanych): we have confused component updating engine. It will create problems at the most inconvenient time
    // TODO (atanych): Redux forever
    this.reduxAnswer()
  },

  setRichTextEditorAnswerWordCount (richTextEditorAnswerCount) {
    this.richTextEditorAnswerCount = richTextEditorAnswerCount
  },

  setDispatch (dispatch) {
    this.dispatch = dispatch
  },

  reduxAnswer () {
    const action = { type: 'flow_processor/ANSWER', result: this.toJSON() }
    if (this.dispatch) { return this.dispatch(action) }

    return getStore() && getStore().dispatch(action)
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
      richTextEditorAnswerWordCount: this.richTextEditorAnswerCount,
    }
  },
})

export default Result
