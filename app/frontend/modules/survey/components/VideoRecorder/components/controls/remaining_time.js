import videojs from 'videojs'

const { I18n } = window

class RemainingTime extends videojs.getComponent('Component') {
  constructor (player, options = {}) {
    super(player, options)

    this.recorder = player.record()
    this.on(player, 'timeupdate', this.updateContent)
  }

  createEl () {
    const el = videojs.dom.createEl('div', {
      className: 'vjs-time-control tte-remaining-time',
    })

    this.contentEl = document.createElement('span')
    el.appendChild(this.contentEl)

    return el
  }

  formatTime (seconds, guide = seconds) {
    seconds = seconds < 0 ? 0 : seconds
    let s = Math.floor(seconds % 60)
    let m = Math.floor((seconds / 60) % 60)
    let h = Math.floor(seconds / 3600)
    const gm = Math.floor((guide / 60) % 60)
    const gh = Math.floor(guide / 3600)

    // handle invalid times
    if (isNaN(seconds) || seconds === Infinity) {
      // '-' is false for all relational operators (e.g. <, >=) so this setting
      // will add the minimum number of fields specified by the guide
      // eslint-disable-next-line no-multi-assign
      h = m = s = '-'
    }

    // Check if we need to show hours
    h = (h > 0 || gh > 0) ? `${h}:` : ''

    // If hours are showing, we may need to add a leading zero.
    // Always show at least one digit of minutes.
    m = `${((h || gm >= 10) && m < 10) ? `0${m}` : m}:`

    // Check if leading zero is need for seconds
    s = (s < 10) ? `0${s}` : s

    return h + m + s
  }

  updateTextNode (time = 0) {
    const timeLeftInSeconds = time
    time = this.formatTime(time)
    if (this.formattedTime === time) {
      return
    }

    this.formattedTime = time

    this.requestAnimationFrame(() => {
      if (!this.contentEl) {
        return
      }

      const oldNode = this.textNode
      this.textNode = document.createTextNode(this.formattedTime)

      if (!this.textNode) {
        return
      }

      if (oldNode) {
        this.contentEl.replaceChild(this.textNode, oldNode)
      } else {
        this.contentEl.appendChild(this.textNode)
      }

      if (!this.timeAlertNode) {
        const screenReaderAlertEle = document.createElement('span')
        screenReaderAlertEle.className = 'sr-only'
        screenReaderAlertEle.setAttribute('role', 'alert')
        screenReaderAlertEle.setAttribute('aria-live', 'polite')
        this.timeAlertNode = screenReaderAlertEle
        this.contentEl.appendChild(this.timeAlertNode)
      }

      if (timeLeftInSeconds % 10 === 0) {
        this.timeAlertNode.innerText = timeLeftInSeconds
          ? I18n.t('assessments.screen_reader_announcements.seconds_left', { seconds: timeLeftInSeconds })
          : I18n.t('assessments.screen_reader_announcements.time_is_up_for_recording')
      }
    })
  }

  show () {
    this.contentEl.parentElement.classList.add('show')
    this.contentEl.parentElement.classList.remove('hide')
  }

  hide () {
    this.contentEl.parentElement.classList.add('hide')
    this.contentEl.parentElement.classList.remove('show')
  }

  updateContent () {
    // eslint-disable-next-line no-underscore-dangle
    if (typeof this.player_.duration() !== 'number') {
      return
    }

    const duration = this.recorder.isRecording() ? this.recorder.maxLength : Math.floor(this.recorder.getDuration())
    const remainingTime = duration - Math.floor(this.recorder.getCurrentTime())

    this.updateTextNode(remainingTime)
  }
}

export default RemainingTime
