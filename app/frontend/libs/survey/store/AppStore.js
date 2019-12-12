import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Assessment from 'models/Assessment'
import QuestionModel from 'models/Question'
import BlockModel from 'models/Block'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import { denormalize } from 'normalizr'
import QuestionSerializer from 'models/QuestionSerializer'
import BlockSerializer from 'models/BlockSerializer'
import { blocks } from './schema'

const { $ } = window

const AppStore = function () {
  this.loaded = false
  this.disabled = false
  this.assessment = null
  // question list
  this.questions = {}
  // use for question center
  this.question = null
  // use for block center
  this.block = null
}

AppStore.prototype = new EventEmitter()

_.extend(AppStore.prototype, {
  init (data) {
    if (this.loaded) { return }
    // Clear trash
    this.assessment = new Assessment(data)
    this.loaded = true
    this.emit('change')
    this.dataSheetColumns = data.data_sheet_columns || []
    this.relationships = data.relationships || []
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
  serializeAssessment (assessmentData, flow) {
    const assessment = Assessment.prototype.toJSON.call({ ...assessmentData.assessment, flow })
    assessment.blocks = []

    // Serialize blocks and questions
    _.each(denormalize(assessmentData.assessment.blocks, [blocks], assessmentData), (blockModel) => {
      const block = BlockModel.prototype.toJSON.call(BlockSerializer.wrap(blockModel))
      block.questions = []
      _.each(blockModel.questions, (questionModel) => {
        const question = QuestionModel.prototype.toJSON.call({
          ...QuestionSerializer.wrap(questionModel),
          block_id: block.id,
        })
        block.questions.push(question)
      })
      assessment.blocks.push(block)
    })
    return assessment
  },

  // Save Assessment
  save (assessment, trash, flow) {
    const builder = {
      assessment: this.serializeAssessment(assessment, flow),
      trash: [],
    }

    // Serialize trash
    _.each(trash, (item) => {
      if (item.model.isNew) { return }
      const deletedItem = item.type === 'block'
        ? ({
          model: BlockModel.prototype.toJSON.call(item.model),
          type: item.type,
          permanent_remove: item.model.permanentRemove,
        })
        : ({
          model: QuestionModel.prototype.toJSON.call(item.model),
          type: item.type,
          permanent_remove: item.model.permanentRemove,
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
