/* eslint-disable global-require */
import { EventEmitter } from 'fbemitter'

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
    callbacks: {
      onShow () {
        this.$el.css('z-index', 5003)
      },
    },
  })
}

dispatcher.notify = function (data) {
  addNotification(data)
}

export default dispatcher
