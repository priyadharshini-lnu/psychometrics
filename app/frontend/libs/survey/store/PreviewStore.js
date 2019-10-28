import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const Preview = function () {
  this.question = null
}

Preview.prototype = new EventEmitter()

_.extend(Preview.prototype, {
  preview (question) {
    this.question = question
    this.question.resetResult()
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new Preview()
