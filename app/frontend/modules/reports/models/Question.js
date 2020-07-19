import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import TranslateManager from './mixins/TranslateManager'

const Question = function (attrs = {}) {
  this.id = attrs.id
  this.position = attrs.position
  this.name = attrs.name
  this.type = attrs.type
  this.props = attrs.props
}

Question.prototype = new EventEmitter()

_.extend(Question.prototype, {
  toJSON () {
    return {
      id: this.id,
      position: this.position,
      name: this.name,
      type: this.type,
      props: this.props,
    }
  },
}, TranslateManager)

export default Question
