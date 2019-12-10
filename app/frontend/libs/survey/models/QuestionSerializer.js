/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable default-case */
import _ from 'lodash'
import DefaultProps from 'constants/DefaultProps'
import ModuleConfigs from 'constants/ModuleConfigs'
import Condition from './QuestionCondition'
import Comment from './Comment'
import Result from './Preview/Result'
import LogicElement from './logic/LogicElement'
import Question from './Question'

const loadComments = (question, comments) => {
  _.each(comments, (comment) => {
    question.comments.push(new Comment(comment))
  })
}

const loadConditions = (question, conditions) => {
  question.validation.args.conditions = []
  _.each(conditions, (condition) => {
    question.validation.args.conditions.push(new Condition(condition))
  })
}

const shuffleChoices = (question) => {
  const { props } = question
  const { choices } = props
  let ids = _.times(choices, i => i)
  if (props.randomization.type !== 'No') {
    ids = _.shuffle(_.times(choices, i => i))
    if (props.randomization.type === 'Some' && props.choices > props.randomization.questions) {
      ids = ids.slice(0, props.randomization.questions)
    }
  }
  question.choicesIds = ids
  return ids
}

export class QuestionSerializer {
  static wrap (attrs) {
    if (!attrs) {
      return null
    }
    const question = _.extend({}, Question.prototype)
    question.id = attrs.id
    question.blockId = attrs.block_id
    question.isNew = attrs.isNew
    question.position = attrs.position
    question.deleted = attrs.deleted || false
    question.name = attrs.name
    question.templateId = attrs.template_id
    question.saveAsTemplate = attrs.save_as_template || false
    question.type = attrs.type || 'MultipleChoice'
    question.comments = []
    question.showComments = question.comments.length > 0
    question.props = _.cloneDeep(DefaultProps[question.type] || {})
    question.props.randomization = { type: 'No' }
    question.moduleConfig = ModuleConfigs[question.type] || {}
    question.requiredValidation = attrs.required_validation || { enabled: false, type: 'Force' }
    question.validation = attrs.validation || { type: 'None', args: {} }
    question.displayLogic = attrs.display_logic ? new LogicElement(attrs.display_logic) : null
    question.skipLogic = attrs.skip_logic || []
    question.deletedAt = attrs.deleted_at
    if (question.skipLogic && question.skipLogic.length) {
      question.skipLogic = _.map(question.skipLogic, condition => new Condition(condition))
    }
    loadComments(question, attrs.comments || [])
    if (question.validation.type === 'Custom') {
      loadConditions(question, attrs.validation.args.conditions || [])
    }
    _.extend(question.props, _.clone(attrs.props))
    shuffleChoices(question)
    question.result = new Result(question)

    return question
  }

  static toJSON (question) {
    return {
      id: question.id,
      block_id: question.blockId,
      name: question.name,
      position: question.position,
      type: question.type,
      props: question.props,
      validation: question.validation,
      required_validation: question.requiredValidation,
      display_logic: question.displayLogic,
      skip_logic: question.skipLogic,
      template_id: question.templateId,
      save_as_template: question.saveAsTemplate,
      deleted_at: question.deletedAt,
      deleted: question.deleted,
      isNew: question.isNew,
    }
  }


  loadConditions (conditions) {
    this.validation.args.conditions = []
    _.each(conditions, (condition) => {
      this.validation.args.conditions.push(new Condition(condition))
    })
  }
}

export default QuestionSerializer
