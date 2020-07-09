const { EventEmitter } = require('fbemitter')

const dispatcher = new EventEmitter()
const { noty } = window

function addNotification (args) {
  args.level = args.level || 'success' // possible are: alert, success, error, warning, info
  args.message = args.message || 'Done'

  noty({
    text: args.message || 'Done',
    type: args.level || 'success',
    timeout: args.timeout || 2000,
    layout: 'topCenter',
  })
}

dispatcher.notify = function (data) {
  addNotification(data)
}

export default dispatcher
