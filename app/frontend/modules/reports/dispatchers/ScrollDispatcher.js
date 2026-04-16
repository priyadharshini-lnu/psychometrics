import { EventEmitter } from 'fbemitter'

const dispatcher = new EventEmitter()
const { $ } = window

const HEADER_HEIGHT = 70

function getTopOffset (name) {
  return $(`[name="${name}"]`).offset().top - HEADER_HEIGHT
}

dispatcher.scroll = function (hash, next = false, onComplete) {
  if (!$(`[name="${hash}"]`).length) { return }
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

dispatcher.scrollIntoView = function (hash, options = {}) {
  const { offset = HEADER_HEIGHT, container = '.page-content', onComplete } = options
  const element = document.querySelector(`[name="${hash}"]`)
  if (!element) return

  const scrollContainer = element.closest(container) || document.querySelector(container)
  if (!scrollContainer) return

  const elementRect = element.getBoundingClientRect()
  const containerRect = scrollContainer.getBoundingClientRect()
  const targetTop = scrollContainer.scrollTop + elementRect.top - containerRect.top - offset

  scrollContainer.scrollTo({
    top: targetTop,
    behavior: 'smooth',
  })

  setTimeout(() => {
    onComplete && onComplete()
  }, 300)
}

export default dispatcher
