import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Assessment from 'models/Assessment'
import QuestionModel from 'models/Question'
import BlockModel from 'models/Block'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import { normalize, denormalize } from 'normalizr'
import QuestionSerializer from 'models/QuestionSerializer'
import BlockSerializer from 'models/BlockSerializer'
import schema, { blocks } from './schema'

const { $ } = window

const AppStore = function () {
  this.loaded = false
  // question list
  this.questions = {}
  // use for question center
  this.question = null
  // use for block center
  this.block = null
  this.rstore = null
}

AppStore.prototype = new EventEmitter()

_.extend(AppStore.prototype, {
  init (data) {
    throw new Error('Should be removed from everywhere')
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
