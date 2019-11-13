import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Assessment from 'models/Assessment'
import QuestionListDispatcher from 'dispatchers/QuestionListDispatcher'
import FactorList from 'store/FactorList'
import QuestionModel from 'models/Question'
import BlockModel from 'models/Block'
import Utils from 'utils/Utils'
import TrashStore from 'store/TrashStore'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import Scoring from 'models/Scoring'
import BlockList from './BlockList'

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
    BlockList.load(data.blocks)
    this.assessment = new Assessment(data)
    this.name = data.name
    this.disabled = false
    FactorList.load(data.factors)
    this.loaded = true
    this.questionRecodingList = data.question_recoding.map(q => new Scoring(q))
    this.emit('change')
    this.fetchQuestions()
    this.dataSheetColumns = data.data_sheet_columns || []
    this.relationships = data.relationships || []
    const urlParams = Utils.getJsonFromUrl()
    // can open scoring with specify factor
    if (urlParams.scoring && urlParams.factor_id) {
      this.openScoring(parseInt(urlParams.factor_id, 10))
    }
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

  disable () {
    this.disabled = true
    this.emit('change')
  },

  enable () {
    this.disabled = false
    this.emit('change')
  },

  update () {
    this.emit('change')
  },

  openScoring (factorId) {
    this.scoring = true
    if (factorId) {
      const factor = _.find(FactorList.list, { id: factorId })
      if (factor) {
        FactorList.changeFactor(factor)
        this.update()
        return
      }
    }
    FactorList.setFirstFactor()
    this.update()
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

  exportAssessment () {
    const result = {
      question: {},
      flow: {},
    }
    _.each(BlockList.list, (block) => {
      _.each(block.questions.list, (question) => {
        result.question[question.id] = question.exportLocales()
      })
    })
    return result
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
  serializeAssessment () {
    const assessment = this.assessment.toJSON()
    assessment.blocks = []

    // Serialize blocks and questions
    _.each(BlockList.list, (blockModel) => {
      const block = blockModel.toJSON()
      block.questions = []
      _.each(blockModel.questions.list, (questionModel) => {
        const question = questionModel.toJSON()
        block.questions.push(question)
      })
      assessment.blocks.push(block)
    })
    return assessment
  },

  // Save Assessment
  save () {
    const builder = {
      assessment: this.serializeAssessment(),
      trash: [],
    }

    // Serialize trash
    _.each(TrashStore.list, (item) => {
      const deletedItem = { model: item.model.toJSON(), type: item.type, permanent_remove: item.permanentRemove }
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
