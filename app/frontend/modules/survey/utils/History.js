const ACTIONS_COUNT = 5

const ActionHistory = function () {
  this.past = []
  this.future = []
  this.present = null
}

ActionHistory.prototype = {
  undo () {
    if (this.canUndo()) {
      this.present.undo()
      this.future.unshift(this.present)
      const action = this.present
      this.present = this.past.pop()
      return action
    }
  },

  redo () {
    if (this.canRedo()) {
      this.past.push(this.present)
      this.present = this.future.shift()
      this.present.redo()
      return this.present
    }
  },

  canUndo () {
    return this.past.length > 0
  },

  canRedo () {
    return this.future.length > 0
  },

  clearFuture () {
    this.future = []
  },

  newAction (action) {
    this.past.push(this.present || action)
    if (this.past.length > ACTIONS_COUNT) {
      this.past.shift()
    }
    if (this.future.length > 0) {
      this.clearFuture()
    }
    this.present = action
  },
}

export default ActionHistory
