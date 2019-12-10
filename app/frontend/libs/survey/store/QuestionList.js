/* eslint-disable no-param-reassign */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Question from 'models/Question'
import Socket from 'cable'

const QuestionList = function (block, questions) {
  this.block = block
  this.list = []
}

QuestionList.prototype = new EventEmitter()

_.extend(QuestionList.prototype, {

  createByTemplate (templateId) {
    Socket.socket().perform('question_create_by_template', {
      block_id: this.block.id,
      template_id: templateId,
    }, (templateData) => {
      const question = new Question(templateData, this)
      this.list.push(question)
      this.update()
    })
  },
})

export default QuestionList
