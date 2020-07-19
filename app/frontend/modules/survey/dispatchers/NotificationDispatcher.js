/* eslint-disable global-require */
const { EventEmitter } = require('fbemitter')

const dispatcher = new EventEmitter()
if (process.env.NODE_ENV === 'test') require('jquery')
const noty = process.env.NODE_ENV === 'test' ? require('noty') : window.noty

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
