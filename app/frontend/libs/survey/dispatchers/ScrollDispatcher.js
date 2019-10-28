const { EventEmitter } = require('fbemitter')

const dispatcher = new EventEmitter()
const { $ } = window

dispatcher.scroll = function (hash) {
  $('html,body').animate({ scrollTop: $(`[name="${hash}"]`).offset().top - 70 }, 200)
}

export default dispatcher
