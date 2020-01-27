const { EventEmitter } = require('fbemitter')

const dispatcher = new EventEmitter()
const { $ } = window

function getTopOffset (name) {
  return $(`[name="${name}"]`).offset().top - 70
}

dispatcher.scroll = function (hash, next = false, onComplete) {
  $('html,body').animate({ scrollTop: getTopOffset(hash) }, 200, () => {
    if (next) {
      setTimeout(() => {
        if ($(`[name="${next}"]`).offset()) {
          $('html,body').animate({ scrollTop: getTopOffset(next) }, 200, () => {
            onComplete && onComplete()
          })
        }
      }, 200)
    }
  })
}

export default dispatcher
