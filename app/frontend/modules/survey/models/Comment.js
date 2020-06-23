import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const Comment = function (attrs = {}) {
  this.id = attrs.id
  this.text = attrs.text || ''
  this.name = attrs.author
  this.date = attrs.date || new Date()
}

Comment.prototype = new EventEmitter()

_.extend(Comment.prototype, {

})

export default Comment
