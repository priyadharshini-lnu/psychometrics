/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable default-case */
import _ from 'lodash'
import Utils from 'utils'
import { EventEmitter } from 'fbemitter'
import DefaultProps from 'constants/DefaultProps'
import Socket from 'cable'
import Action from 'undo'
import rstore from 'store'
import Condition from './QuestionCondition'
import Comment from './Comment'
import Result from './Preview/Result'
import TranslateManager from './mixins/TranslateManager'
import LogicElement from './logic/LogicElement'

let count = 1

const Question = function (attrs = {}) {
  if (attrs.id) {
    this.id = attrs.id
    this.isNew = false
  } else {
    this.id = Date.now() + count
    this.isNew = true
  }
  this.blockId = attrs.block_id
  this.position = attrs.position
  this.deleted = attrs.deleted || false
  this.name = attrs.name || `Q${count}`
  this.templateId = attrs.template_id
  this.saveAsTemplate = false
  this.type = attrs.type || 'MultipleChoice'
  this.comments = []
  this.loadComments(attrs.comments || [])
  this.showComments = this.comments.length > 0
  this.props = _.cloneDeep(DefaultProps[this.type] || {})
  this.props.randomization = { type: 'No' }
  this.requiredValidation = attrs.required_validation || { enabled: false, type: 'Force' }
  this.validation = attrs.validation || { type: 'None', args: {} }
  this.displayLogic = attrs.display_logic ? new LogicElement(attrs.display_logic) : null
  this.skipLogic = attrs.skip_logic || []
  this.deletedAt = attrs.deleted_at
  if (this.skipLogic && this.skipLogic.length) {
    this.skipLogic = _.map(this.skipLogic, condition => new Condition(condition))
  }
  if (this.validation.type === 'Custom') {
    this.loadConditions(attrs.validation.args.conditions || [])
  }
  _.extend(this.props, attrs.props)
  this.shuffleChoices()
  this.result = new Result(this)
  count += 1
}

Question.prototype = new EventEmitter()

_.extend(Question.prototype, {

  toJSON () {
    return {
      id: this.isNew ? undefined : this.id,
      block_id: this.blockId,
      name: this.name,
      position: this.position,
      type: this.type,
      props: this.props,
      validation: this.validation,
      required_validation: this.requiredValidation,
      display_logic: this.displayLogic,
      skip_logic: this.skipLogic,
      template_id: this.templateId,
      save_as_template: this.saveAsTemplate,
      deleted_at: this.deletedAt,
    }
  },

  isTemplate () {
    return this.templateId || this.saveAsTemplate
  },

  resetValidation () {
    this.validation = { type: 'None', args: {} }
  },

  resetResult () {
    this.result = new Result(this)
  },

  resetDefaultValues () {
    this.props.defaultValues = _.cloneDeep(DefaultProps[this.type].defaultValues || [])
    this.resetResult()
    this.emit('resetDefaultValues')
  },

  rename (name) {
    this.name = name
  },

  addComment (data) {
    const comment = new Comment(data)
    Socket.socket().perform('comment_create', { question_id: this.id, text: comment.text }, (data) => {
      Object.assign(comment, { id: data.id, name: data.author })
      this.comments.push(comment)
      this.store.update()
    })
  },

  loadComments (comments) {
    _.each(comments, (comment) => {
      this.comments.push(new Comment(comment))
    })
  },

  loadConditions (conditions) {
    this.validation.args.conditions = []
    _.each(conditions, (condition) => {
      this.validation.args.conditions.push(new Condition(condition))
    })
  },

  removeComment (comment) {
    _.remove(this.comments, comment)
  },

  clone () {
    this.store.clone(_.cloneDeep(this))
  },

  addNote () {
    this.showComments = true
    this.store.update()
  },

  setChoices (val, undo) {
    const oldValue = this.props.choices
    this.props.choices = Utils.limit(val)
    this.props.choicesTexts.splice(this.props.choices)
    for (let i = 0; i < this.props.choices; i += 1) {
      if (!this.props.choicesTexts[i]) {
        this.props.choicesTexts[i] = this.moduleConfig.defaultChoiceText(i + 1)
      }
    }
    if (!undo) {
      Action('QuestionChangeChoices', this, { oldValue, newValue: this.props.choices })
    }
    this.update()
  },

  setFormFields (val) {
    this.setChoices(val)
    this.shuffleChoices()
  },

  customValidationAnswers () {
    if (!this.moduleConfig.customValidations) {
      return
    }
    switch (this.type) {
      case 'MatrixTable':
        return this.customValidationMatrixAnswers()
      case 'SideBySide':
        return this.customValidationSideBySideAnswers()
      case 'HotSpot':
        return this.customValidationHotSpotAnswers()
      case 'PickGroupRank':
        return this.customValidationPickGroupRankAnswers()
      case 'GraphicSlider':
        return this.customValidationGraphicSlider()
      case 'GapAnalysis':
        return this.customValidationGapAnalysis()
      case 'Timing':
        return this.customValidationTiming()
      case 'MetaInfo':
        return this.customValidationMetaInfo()
      case 'Captcha':
        return this.customValidationCaptcha()
      case 'StaticContent':
        return this.customValidationStaticContent()
    }
    const fields = this.moduleConfig.customValidations[this.props.type]
    let result = []
    if (fields.collection) {
      result = _.map(this.props[fields.collection], (field, i) => ({
        value: i.toString(),
        label: `${field || this.moduleConfig.defaultChoiceText(i + 1)}`,
        type: fields.type,
      }))
    }

    if (fields.additional) {
      _.each(fields.additional, (condition) => {
        result.push(condition)
      })
    }

    return result
  },

  changeType (type, props) {
    const newProps = _.cloneDeep(DefaultProps[type])

    Object.assign(newProps, props, {
      questionText: this.props.questionText,
      choicesTexts: this.props.choicesTexts || [],
      randomization: this.props.randomization,
    })

    this.props = newProps
    this.type = type
    this.requiredValidation = { enabled: false, type: 'Force' }
    this.validation = { type: 'None', args: {} }
  },

  changeProps (newProps, undo) {
    const oldProps = {}
    for (const k in newProps) {
      oldProps[k] = _.cloneDeep(this.props[k])
      this.props[k] = _.cloneDeep(newProps[k])
      if (k === 'type') {
        this.resetValidation()
      }
    }
    if (!undo) {
      Action('QuestionChangeProps', this, { newProps, oldProps })
    }
    this.update()
  },

  changeReqValidations (newProps, undo) {
    const oldProps = {}
    for (const k in newProps) {
      oldProps[k] = _.cloneDeep(this.requiredValidation[k])
      this.requiredValidation[k] = _.cloneDeep(newProps[k])
    }
    if (!undo) {
      Action('QuestionChangeReqValidations', this, { newProps, oldProps })
    }
    this.update()
  },

  changeValidation (newProps, undo) {
    const oldProps = {}
    for (const k in newProps) {
      oldProps[k] = _.cloneDeep(this.validation[k])
      this.validation[k] = _.cloneDeep(newProps[k])
    }
    if (!undo) {
      Action('QuestionChangeValidations', this, { newProps, oldProps })
    }
    this.update()
  },

  changeArrayProps ({ collection, i, val }, undo) {
    const oldProps = {
      collection,
      i,
      val: this.props[collection][i],
    }
    this.props[collection][i] = val
    const newProps = {
      collection,
      i,
      val: this.props[collection][i],
    }
    if (!undo) {
      Action('QuestionChangeArrayProps', this, { newProps, oldProps })
    }
    this.update()
  },

  update () {
    this.shuffleChoices()
    // this.resetDefaultValues()  why it was reseting?
    // this.sync()
    // this.store.update()

    // NOTE: @fedor the next dispatches it's a hack to update ui. should be removed later
    rstore.dispatch({ type: 'builder/assessment/question/UPDATE_QUESTION', question: this })
    // rstore.dispatch({ type: 'survey/assessment/FAKE_UPDATE' })
  },

  updateDefaultProps () {
    rstore.dispatch({ type: 'builder/assessment/question/UPDATE_QUESTION', question: this })
  },

  sync () {
  },

  hasOption (option) {
    return this.props.options.indexOf(option) !== -1
  },

  /**
   * Return array of choices indexes
   * @returns {Array}
   */
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

  hasDefaultValues () {
    if (this.props.defaultValues.length > 0) {
      return this.type !== 'TextEntry' || _.some(
        this.props.defaultValues, object => object.value,
      )
    }
    return false
  },

  clearDisplayLogic () {
    this.displayLogic = null
    this.update()
  },
}, TranslateManager)

export default Question
