import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import DefaultProps from 'constants/DefaultProps'
import ModuleConfigs from 'constants/ModuleConfigs'
import Condition from '../QuestionCondition'
import Result from './Result'
import TranslateManager from '../mixins/TranslateManager'

export const Question = function (attrs = {}, store, results = {}) {
  this.id = attrs.id
  this.store = store
  this.position = attrs.position
  this.name = attrs.name
  this.type = attrs.type
  this.props = _.cloneDeep(DefaultProps[this.type] || {})
  this.props.randomization = { type: 'No' }
  this.moduleConfig = ModuleConfigs[this.type] || {}
  this.requiredValidation = attrs.required_validation
  this.validation = attrs.validation || { type: 'None', args: {} }
  if (this.validation.type === 'Custom') {
    this.loadConditions(attrs.validation.args.conditions || [])
  }
  this.displayLogic = attrs.display_logic
  this.skipLogic = attrs.skip_logic || []
  _.extend(this.props, attrs.props)
  this.shuffleChoices()
  this.result = new Result(this, results.answers, results.notApplicable)
  this.errors = []
}

Question.prototype = new EventEmitter()

_.extend(Question.prototype, {

  loadConditions (conditions) {
    this.validation.args.conditions = []
    _.each(conditions, (condition) => {
      this.validation.args.conditions.push(new Condition(condition))
    })
  },

  validate () {
    this.errors = []
    this.errors = this.result.validate()
    return this.errors
  },

  hasOption (option) {
    return this.props.options.indexOf(option) !== -1
  },

  shuffleChoices () {
    const { props } = this
    const { choices } = props
    let ids = _.times(choices, i => i)
    if (props.randomization.type !== 'No') {
      ids = _.shuffle(_.times(choices, i => i))
      if (props.randomization.type === 'Some' && props.choices > props.randomization.questions) {
        ids = ids.slice(0, props.randomization.questions)
      }
    }
    this.choicesIds = ids
    return ids
  },

  resetAnswers () {
    this.result = new Result(this)
    this.errors = []
  },

}, TranslateManager)

export default Question
