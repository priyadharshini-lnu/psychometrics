import ActionHistory from 'rb/utils/History'

let actionHistory = new ActionHistory()

const store = {
  get () {
    return actionHistory
  },

  set (newdata = new ActionHistory()) {
    actionHistory = newdata
  },

  undo () {
    return actionHistory.undo()
  },

  redo () {
    return actionHistory.redo()
  },

  newAction (action) {
    actionHistory.newAction(action)
    this.onChange && this.onChange()
  },
}

export default store
