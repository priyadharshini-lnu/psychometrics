import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Assessment from 'models/Assessment'
import QuestionListDispatcher from 'dispatchers/QuestionListDispatcher'
import FactorList from 'store/FactorList'
import QuestionModel from 'models/Question'
import BlockModel from 'models/Block'
import TrashStore from 'store/TrashStore'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import Scoring from 'models/Scoring'
import { denormalize } from 'normalizr'
import QuestionSerializer from 'models/QuestionSerializer'
import BlockList from './BlockList'
import { blocks } from './schema'
const { $ } = window

const AppStore = function () {
  this.loaded = false
  this.disabled = false
  this.assessment = null
  this.scoring = false
  // question list
  this.questions = {}
  // use for question center
  this.question = null
  // use for block center
  this.block = null
  this.dispatcher = new QuestionListDispatcher(this)
}

AppStore.prototype = new EventEmitter()

_.extend(AppStore.prototype, {
  init (data) {
    if (this.loaded) { return }
    // Clear trash
    TrashStore.list = []
    // BlockList.load(data.blocks)
    this.assessment = new Assessment(data)
    FactorList.load(data.factors)
    this.loaded = true
    this.questionRecodingList = data.question_recoding.map(q => new Scoring(q))
    this.emit('change')
    this.fetchQuestions()
    this.dataSheetColumns = data.data_sheet_columns || []
    this.relationships = data.relationships || []
  },

  addQuestionRecoding (attrs = {}) {
    const scoring = new Scoring(attrs)
    this.questionRecodingList.push(scoring)
    return scoring
  },

  fetchQuestions () {
    this.questions = _.flatten(BlockList.list.map(block => block.questions.list))
    this.questions = _.reduce(this.questions, (obj, q) => {
      obj[q.id] = q
      return obj
    }, {})
  },

  update () {
    this.emit('change')
  },

  initQCenter (question) {
    if (question) {
      this.loaded = true
      this.question = new QuestionModel(question, this)
      this.update()
    }
  },

  initBCenter (block) {
    if (block) {
      this.loaded = true
      this.block = new BlockModel(block, this)
      this.update()
    }
  },

  // Serialize Assessment
  // assessment: {
  //   - Assessment Attributes (props, flow, norm)
  //   blocks: [
  //     ...
  //     {
  //       - Block Attributes
  //       questions: [
  //         ...
  //         {
  //           - Question Attributes
  //         }
  //       ]
  //     }
  //   ]
  // }
  serializeAssessment (assessmentData) {
    const assessment = Assessment.prototype.toJSON.call(assessmentData.assessment)
    assessment.blocks = []

    // Serialize blocks and questions
    _.each(denormalize(assessmentData.assessment.blocks, [blocks], assessmentData), (blockModel) => {
      const block = BlockModel.prototype.toJSON.call(blockModel)
      block.questions = []
      _.each(blockModel.questions, (questionModel) => {
        const question = QuestionModel.prototype.toJSON.call({ ...QuestionSerializer.wrap(questionModel), block_id: block.id })
        block.questions.push(question)
      })
      assessment.blocks.push(block)
    })
    return assessment
  },

  // Save Assessment
  save (assessment, trash) {
    const builder = {
      assessment: this.serializeAssessment(assessment),
      trash: [],
    }

    // Serialize trash
    _.each(trash, (item) => {
      if (item.isNew) { return }
      const deletedItem = item.type === 'block'
        ? ({
          model: BlockModel.prototype.toJSON.call(item.model),
          type: item.type,
          permanent_remove: item.permanentRemove,
        })
        : ({
          model: QuestionModel.prototype.toJSON.call(item.model),
          type: item.type,
          permanent_remove: item.permanentRemove,
        })
      builder.trash.push(deletedItem)
    })

    $.ajax({
      method: 'PUT',
      url: `/administration/assessments/${this.assessment.id}/builders`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ builder }),
      error: (jqXHR, textStatus, errorThrown) => {
        console.info(jqXHR, textStatus, errorThrown)
        NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
      },
      success: (data) => {
        this.loaded = false
        this.init(data.data)
        NotificationDispatcher.notify({ message: 'Assessment successfully saved' })
      },
    })
  },

  // Save Scoring
  // scoring: [
  //   {
  //     - Scoring Attributes
  //   }
  // ]
  saveScoring () {
    const scoring = []
    _.each(FactorList.list, (factorModel) => {
      _.each(factorModel.scoring.list, (scoringModel) => {
        scoring.push(scoringModel.toJSON())
      })
    })

    this.loaded = false
    this.update()

    $.ajax({
      method: 'PUT',
      url: `/administration/assessments/${this.assessment.id}/scoring`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ scoring, question_recoding: this.questionRecodingList }),
      error: (jqXHR, textStatus, errorThrown) => {
        console.info(jqXHR, textStatus, errorThrown)
        NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
      },
      success: (data) => {
        this.init(data.data)
        NotificationDispatcher.notify({ message: 'Scoring successfully saved' })
      },
    })
  },

  // QCenter
  // Save Question Template
  saveQuestion () {
    const question = this.question.toJSON()

    $.ajax({
      method: 'PUT',
      url: `/administration/templates/questions/${this.question.id}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ question }),
      error: (jqXHR, textStatus, errorThrown) => {
        console.info(jqXHR, textStatus, errorThrown)
        NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
      },
      success: (data) => {
        this.loaded = false
        this.initQCenter(data.data)
        NotificationDispatcher.notify({ message: 'Question successfully saved' })
      },
    })
  },

  // BCenter
  // Save Block Template
  saveBlock () {
    const block = this.block.toJSON()
    block.questions = []
    _.each(this.block.questions.list, (questionModel) => {
      const question = questionModel.toJSON()
      block.questions.push(question)
    })

    $.ajax({
      method: 'PUT',
      url: `/administration/templates/blocks/${this.block.id}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ block }),
      error: (jqXHR, textStatus, errorThrown) => {
        console.info(jqXHR, textStatus, errorThrown)
        NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
      },
      success: (data) => {
        this.loaded = false
        this.initBCenter(data.data)
        NotificationDispatcher.notify({ message: 'Block successfully saved' })
      },
    })
  },
})

export default new AppStore()
