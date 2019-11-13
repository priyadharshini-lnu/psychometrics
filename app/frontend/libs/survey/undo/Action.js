import _ from 'lodash'

const Action = function (subject, redo, undo, rArgs = [], uArgs = [], name = '') {
  this.subject = subject
  this.redoAction = redo
  this.redoArgs = rArgs
  this.undoAction = undo
  this.undoArgs = uArgs
  this.name = name
}

Action.prototype = {
  undo () {
    _.invoke(this.subject, this.undoAction, ...this.undoArgs)
  },

  redo () {
    _.invoke(this.subject, this.redoAction, ...this.redoArgs)
  },
}

export default Action
