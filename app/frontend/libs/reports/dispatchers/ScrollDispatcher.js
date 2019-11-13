const { EventEmitter } = require('fbemitter')

const dispatcher = new EventEmitter()
const { $ } = window

function getTopOffset (name) {
  return $(`[name="${name}"]`).offset().top - 70
}

dispatcher.scroll = function (hash, next = false) {
  $('html,body').animate({ scrollTop: getTopOffset(hash) }, 200, () => {
    if (next) {
      $('html,body').animate({ scrollTop: getTopOffset(next) }, 200)
    }
  })
}

export default dispatcher
