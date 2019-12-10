/* eslint-disable no-param-reassign */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const QuestionList = function (block) {
  this.block = block
  this.list = []
}

QuestionList.prototype = new EventEmitter()

_.extend(QuestionList.prototype, {
})

export default QuestionList
