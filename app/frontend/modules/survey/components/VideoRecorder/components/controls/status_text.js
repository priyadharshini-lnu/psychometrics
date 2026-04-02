import videojs from 'videojs'

class StatusText extends videojs.getComponent('Component') {
  constructor (player, options) {
    super(player, options)

    this.on(player, 'statechanged', this.updateContent)
    if (options.text) {
      this.updateTextContent(options.text)
    }
  }

  createEl () {
    const el = videojs.dom.createEl('div', {
      className: 'tte-status-text default hide',
    })

    this.contentEl = document.createElement('span')
    el.appendChild(this.contentEl)

    return el
  }

  updateTextContent (text) {
    if (typeof text !== 'string') {
      text = I18n.t('shared.status_unknown')
    }

    const oldNode = this.textNode
    this.textNode = document.createTextNode(text)

    if (oldNode) {
      this.contentEl.replaceChild(this.textNode, oldNode)
    } else {
      this.contentEl.appendChild(this.textNode)
    }
  }

  show () {
    this.contentEl.parentElement.classList.add('show')
    this.contentEl.parentElement.classList.remove('hide')
  }

  hide () {
    this.contentEl.parentElement.classList.add('hide')
    this.contentEl.parentElement.classList.remove('show')
  }

  reset () {
    this.contentEl.parentElement.classList.add('show')
    this.contentEl.parentElement.classList.add('default')
    this.contentEl.parentElement.classList.remove('hide')

    this.updateTextContent(I18n.t('assessments.video_response.start_recording'))
  }

  updateContent (event, detail) {
    if (detail.status === 'saved') {
      this.hide()
      return
    }

    this.contentEl.parentElement.classList.remove('default')

    let translatedStatus = detail.status
    if (detail.status === 'recording') {
      translatedStatus = I18n.t('shared.recording')
    } else if (detail.status === 'recorded') {
      translatedStatus = I18n.t('shared.recorded')
    }

    this.updateTextContent(translatedStatus)
  }
}

export default StatusText
