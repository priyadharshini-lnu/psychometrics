import _ from 'lodash'
import FE from 'froala-editor'

const { $ } = window

Object.assign(FE.POPUP_TEMPLATES, {
  'audio.insert': '[_BUTTONS_][_BY_URL_LAYER_]',
  'audio.edit': '[_BUTTONS_]',
})
Object.assign(FE.DEFAULTS, {
  audioEditButtons: ['audioReplace', 'audioRemove', '|', 'audioAutoplay', 'audioAlign', 'audioSkin'],
  audioInsertButtons: ['audioBack', '|'],
  audioMove: true,
  audioSplitHTML: true,
})

FE.PLUGINS.audio = function (editor) {
  let currentAudio = null

  const stopEditing = function (audio) {
    if (!audio) audio = editor.$el.find('.fr-audio')
    if (!audio.length) return
    editor.toolbar.enable()
    audio.removeClass('fr-active')
    currentAudio = null
  }

  const refreshInsertPopup = function () {
    const $popup = editor.popups.get('audio.insert')
    const $inputs = $popup.find('input, button')
    const currentUrl = currentAudio ? currentAudio.find('audio').attr('src') : ''
    $($inputs).prop('disabled', false).val(currentUrl).trigger('change')
  }

  const showPopup = function (id, left, top, height) {
    editor.popups.show(id, left, top, height)
    editor.popups.get(id).css('z-index', 9999999)
  }

  /* eslint-disable camelcase */
  const initInsertPopup = function () {
    editor.popups.onRefresh('audio.insert', refreshInsertPopup)

    const buttonSpec = editor.opts.audioInsertButtons
    const buttons = buttonSpec.length < 2 ? '' : `<div class="fr-buttons">
                ${editor.button.buildList(buttonSpec)}
            </div>`

    const by_url_layer = `
      <div class="fr-audio-by-url-layer fr-layer" id="fr-audio-by-url-layer-${editor.id}">
        <div class="fr-input-line">
          <input id="fr-audio-by-url-layer-text-${editor.id}" type="text"
            placeholder="${editor.language.translate('Paste in an audio URL')}" tabIndex="1" aria-required="true" />
        </div>
        <div class="fr-action-buttons">
          <button type="button" class="fr-command fr-submit" data-cmd="audioInsertByURL"
            tabIndex="2" role="button">${editor.language.translate('Insert')}</button>
        </div>
      </div>`

    const $popup = editor.popups.create('audio.insert', { buttons, by_url_layer })
    return $popup
  }

  const initEditPopup = function () {
    const buttonSpec = editor.opts.audioEditButtons
    const buttons = buttonSpec.length < 1 ? '' : `<div class="fr-buttons"><div class="fr-btn-grp">
                ${editor.button.buildList(buttonSpec)}
            </div></div>`
    return editor.popups.create('audio.edit', { buttons })
  }
  /* eslint-enable camelcase */


  const addNewAudio = function (src, data = {}) {
    const $audio = $('<span contenteditable="false" draggable="true" class="fr-audio">'
                + '<audio controls="controls" controlsList="nodownload"></audio>'
            + '</span>')
    $audio.toggleClass('fr-draggable', editor.opts.audioMove)

    editor.events.focus(true)
    editor.selection.restore()

    editor.undo.saveStep()

    if (editor.opts.audioSplitHTML) {
      editor.markers.split()
    } else {
      editor.markers.insert()
    }

    editor.html.wrap()
    const $marker = editor.$el.find('.fr-marker')

    // Do not insert audio inside emoticon.
    if (editor.node.isLastSibling($marker) && $marker.parent().hasClass('fr-deletable')) {
      $marker.insertAfter($marker.parent())
    }

    $marker.replaceWith($audio)
    editor.selection.clear()

    const player = $audio.find('audio')
    player
      .text(editor.language.translate('Your browser does not support HTML5 audio.'))
      .on('canplaythrough loadeddata', () => {
        editor.popups.hide('audio.insert')
        editor.events.trigger('audio.loaded', [$audio])
      })
      .on('error', (e) => {
        editor.popups.hide('audio.insert')
        editor.events.trigger('audio.error', [$audio, e])
      })
      .attr(_.mapKeys(data, (v, k) => `data-${_.kebabCase(k)}`))
      .attr({ src })

    return $audio
  }

  const replaceAudio = function ($audio, src) {
    const player = $audio.find('audio')
    // If you try to replace it with itself, we clear the src first so that the events still fire.
    if (player.attr('src') === src) player.attr({ src: '' })

    player
      .off('canplaythrough loadeddata')
      .off('error')
      .on('canplaythrough loadeddata', () => {
        editor.popups.hide('audio.insert')
        editor.events.trigger('audio.loaded', [$audio])
        stopEditing($audio)
      })
      .on('error', (e) => {
        editor.audio.showEditPopup($audio)
        editor.events.trigger('audio.error', [$audio, e])
      })
      .attr({ src })
    return $audio
  }

  const insertHtmlAudio = function (link, response) {
    editor.edit.on()

    const replace = !!currentAudio
    const $audio = replace ? replaceAudio(currentAudio, link) : addNewAudio(link, response)

    editor.undo.saveStep()
    editor.events.trigger(replace ? 'audio.replaced' : 'audio.inserted', [$audio, response])
  }

  let touchScroll = false
  const editAudio = function (e) {
    const $audio = $(this)
    if (touchScroll && e && e.type === 'touchend') {
      return true
    }
    if (editor.edit.isDisabled()) {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }
      return false
    }
    editor.toolbar.disable()

    // Hide keyboard.
    if (editor.helpers.isMobile()) {
      editor.events.disableBlur()
      editor.$el.blur()
      editor.events.enableBlur()
    }

    if (currentAudio) currentAudio.removeClass('fr-active')
    currentAudio = $audio
    $audio.addClass('fr-active')

    if (editor.opts.iframe) editor.size.syncIframe()
    editor.audio.showEditPopup($audio)

    editor.selection.clear()
    const range = editor.doc.createRange()
    range.selectNode($audio[0])
    editor.selection.get().addRange(range)

    editor.button.bulkRefresh()
    return true
  }

  return {
    /* eslint no-underscore-dangle: 0 */
    _init () {
      if (editor.helpers.isMobile()) {
        editor.events.$on(editor.$el, 'touchstart', 'span.fr-audio', () => {
          touchScroll = false
        })

        editor.events.$on(editor.$el, 'touchmove', () => {
          touchScroll = true
        })
      }
      editor.events.$on(editor.$el, 'mousedown', 'span.fr-audio', (e) => {
        e.stopPropagation()
      })
      editor.events.$on(editor.$el, 'click touchend', 'span.fr-audio', editAudio)
      editor.events.on('mouseup window.mouseup', () => stopEditing())
      editor.events.on('commands.mousedown', ($btn) => {
        if ($btn.parents('.fr-toolbar').length) stopEditing()
      })
    },
    showInsertPopup () {
      if (!editor.popups.get('audio.insert')) initInsertPopup()
      editor.audio.showLayer('audio-by-url')
    },
    showEditPopup ($audio) {
      const $popup = 'audio.edit'
      if (!editor.popups.get($popup)) initEditPopup()
      editor.popups.setContainer($popup, editor.$sc)
      editor.popups.refresh($popup)

      const $player = $audio.find('audio')
      const { left, top } = $player.offset()
      const height = $player.outerHeight()

      showPopup($popup, left + $player.outerWidth() / 2, top + height, height)
      editor.popups.get($popup).css('z-index', 9999999)
    },

    refreshByURLButton ($btn) {
      const $popup = editor.popups.get('audio.insert')
      if ($popup.find('.fr-audio-by-url-layer').hasClass('fr-active')) {
        $btn.addClass('fr-active').attr('aria-pressed', true)
      }
    },

    autoplay () {
      if (!currentAudio) return false
      const isAuto = currentAudio.attr('data-autoplay') === 'true'
      currentAudio.attr('data-autoplay', !isAuto)
    },
    align (val) {
      if (!currentAudio) return false
      // Center is the default, so just clear the alignment if that's what was requested.
      if (val === 'center') val = ''
      currentAudio.addClass(`align-${val}`)
      currentAudio.attr('data-align', val)
      // Changing the alignment will almost certainly move the actual audio player away from the edit popup,
      // so we re-display the popup to get them back in sync.
      editor.audio.showEditPopup(currentAudio)
    },

    skin (val) {
      if (!currentAudio) return false
      // Center is the default, so just clear the alignment if that's what was requested.
      currentAudio.attr('data-skin', val)
      // Changing the alignment will almost certainly move the actual audio player away from the edit popup,
      // so we re-display the popup to get them back in sync.
      editor.audio.showEditPopup(currentAudio)
    },

    refreshAutoplayButton ($btn) {
      if (!currentAudio) return false
      const isAuto = currentAudio.attr('data-autoplay') === 'true'
      $btn.toggleClass('fr-active', isAuto).attr('aria-pressed', isAuto)
    },
    refreshAlignButton ($btn) {
      if (!currentAudio) return false
      const align = currentAudio.attr('data-align') || 'center'
      // This is copied from how the video plugin does it. Yes, it's gross.
      $btn.find('>*').first().replaceWith(editor.icon.create(`audioAlign${_.capitalize(align)}`))
    },
    refreshAlignDropdown ($btn, $dropdown) {
      if (!currentAudio) return
      const align = currentAudio.attr('data-align') || 'center'
      $dropdown.find(`.fr-command[data-param1="${align}"]`).addClass('fr-active').attr('aria-selected', true)
    },

    refreshSkinDropdown ($btn, $dropdown) {
      if (!currentAudio) return
      const skin = currentAudio.attr('data-skin') || 'none'
      $dropdown.find(`.fr-command[data-param1="${skin}"]`).addClass('fr-active').attr('aria-selected', true)
    },

    back () {
      if (currentAudio) {
        editor.audio.showEditPopup(currentAudio)
      } else {
        editor.events.disableBlur()
        editor.selection.restore()
        editor.events.enableBlur()

        editor.popups.hide('audio.insert')
        editor.toolbar.showInline()
      }
    },
    refreshBackButton ($btn) {
      const showBack = currentAudio || editor.opts.toolbarInline
      $btn.toggleClass('fr-hidden', !showBack)
      $btn.next('.fr-separator').toggleClass('fr-hidden', !showBack)
    },

    showLayer (name) {
      const $popup = editor.popups.get('audio.insert')
      editor.popups.setContainer('audio.insert', currentAudio ? editor.$sc : editor.$tb)

      let left; let top; let
        height = 0
      if (currentAudio) {
        const $player = currentAudio.find('audio')
        height = $player.outerHeight()

        const offset = $player.offset()
        left = offset.left + $player.width() / 2
        top = offset.top + height
      } else if (editor.opts.toolbarInline) {
        // Set top to the popup top.
        top = $popup.offset().top - editor.helpers.getPX($popup.css('margin-top'))

        // If the popup is above apply height correction.
        if ($popup.hasClass('fr-above')) top += $popup.outerHeight()
      } else {
        const $btn = editor.$tb.find('.fr-command[data-cmd="insertAudio"]')
        const offset = $btn.offset()
        left = offset.left + $btn.outerWidth() / 2
        top = offset.top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10)
      }

      // Show the new layer.
      $popup.find('.fr-layer').removeClass('fr-active')
      $popup.find(`.fr-${name}-layer`).addClass('fr-active')
      showPopup('audio.insert', left, top, height)
      editor.accessibility.focusPopup($popup)
      editor.popups.refresh('audio.insert')
    },

    insertByURL (link) {
      if (!link) {
        const $popup = $(editor.popups.get('audio.insert'))
        link = ($popup.find('.fr-audio-by-url-layer input[type="text"]').val() || '').trim()
        $popup.find('input, button').prop({ disabled: true })
      }

      if (!/^http/.test(link)) link = `https://${link}`
      insertHtmlAudio(link)
    },

    replace () {
      if (!currentAudio) return
      editor.audio.showInsertPopup()
    },

    remove () {
      if (!currentAudio) return
      const $audio = currentAudio
      if (editor.events.trigger('audio.beforeRemove', [$audio]) === false) return
      editor.popups.hideAll()

      const el = $audio[0]
      editor.selection.setBefore(el) || editor.selection.setAfter(el)
      $audio.remove()
      editor.selection.restore()

      editor.html.fillEmptyBlocks()
      editor.events.trigger('audio.removed', [$audio])
      stopEditing($audio)
    },
  }
}

FE.DefineIcon('insertAudio', { NAME: 'volume-up', template: 'font_awesome' })
FE.RegisterCommand('insertAudio', {
  title: 'Insert Audio',
  undo: false,
  focus: true,
  refreshAfterCallback: false,
  popup: true,
  callback () {
    if (!this.popups.isVisible('audio.insert')) return this.audio.showInsertPopup()
    if (this.$el.find('.fr-marker').length) {
      this.events.disableBlur()
      this.selection.restore()
    }
    return this.popups.hide('audio.insert')
  },
  plugin: 'audio',
})

FE.RegisterCommand('audioInsertByURL', {
  undo: true,
  focus: true,
  callback () {
    this.audio.insertByURL()
  },
})

FE.DefineIcon('audioAlignLeft', { NAME: 'align-left', template: 'font_awesome' })
FE.DefineIcon('audioAlignRight', { NAME: 'align-right', template: 'font_awesome' })
FE.DefineIcon('audioAlignCenter', { NAME: 'align-justify', template: 'font_awesome' })

FE.DefineIcon('audioAlign', { NAME: 'align-center', template: 'font_awesome' })
FE.RegisterCommand('audioAlign', {
  type: 'dropdown',
  title: 'Align',
  options: {
    left: 'Align Left',
    center: 'None',
    right: 'Align Right',
  },
  html () {
    const mkOption = (label, val) => `<li role="presentation">
                <a class="fr-command fr-title" tabIndex="-1" role="option" data-cmd="audioAlign"
                   data-param1="${val}" title="${this.language.translate(label)}">
                    ${this.icon.create(`audioAlign${_.capitalize(val)}`)}
                    <span class="fr-sr-only">${this.language.translate(label)}</span>
                </a>
            </li>`

    return `<ul class="fr-dropdown-list" role="presentation">
                ${_.map(FE.COMMANDS.audioAlign.options, mkOption).join('\n')}
            </ul>`
  },
  callback (cmd, val) {
    this.audio.align(val)
  },
  refresh ($btn) {
    this.audio.refreshAlignButton($btn)
  },
  refreshOnShow ($btn, $dropdown) {
    this.audio.refreshAlignDropdown($btn, $dropdown)
  },
})

FE.DefineIcon('audioSkin', { NAME: 'paint-brush', template: 'font_awesome' })
FE.RegisterCommand('audioSkin', {
  type: 'dropdown',
  title: 'Skin',
  options: {
    none: 'None',
    GreenAudio: 'Full',
    WaveSurfer: 'Waveform',
  },
  html () {
    const mkOption = (label, val) => `<li role="presentation">
                <a class="fr-command fr-title" tabIndex="-1" role="option" data-cmd="audioSkin"
                   data-param1="${val}" title="${this.language.translate(label)}">
                    ${this.language.translate(label)}
                </a>
            </li>`

    return `<ul class="fr-dropdown-list" role="presentation">
                ${_.map(FE.COMMANDS.audioSkin.options, mkOption).join('\n')}
            </ul>`
  },
  callback (cmd, val) {
    this.audio.skin(val)
  },
  refreshOnShow ($btn, $dropdown) {
    this.audio.refreshSkinDropdown($btn, $dropdown)
  },
})

FE.DefineIcon('audioAutoplay', { NAME: 'play-circle', template: 'font_awesome' })
FE.RegisterCommand('audioAutoplay', {
  title: 'Autoplay',
  toggle: true,
  callback () {
    this.audio.autoplay()
  },
  refresh ($btn) {
    this.audio.refreshAutoplayButton($btn)
  },
})

FE.DefineIcon('audioReplace', { NAME: 'exchange', template: 'font_awesome' })
FE.RegisterCommand('audioReplace', {
  title: 'Replace',
  undo: false,
  focus: false,
  popup: true,
  refreshAfterCallback: false,
  callback () {
    this.audio.replace()
  },
})

FE.DefineIcon('audioRemove', { NAME: 'trash', template: 'font_awesome' })
FE.RegisterCommand('audioRemove', {
  title: 'Remove',
  callback () {
    this.audio.remove()
  },
})

FE.DefineIcon('audioBack', { NAME: 'arrow-left', template: 'font_awesome' })
FE.RegisterCommand('audioBack', {
  title: 'Back',
  undo: false,
  focus: false,
  back: true,
  callback () {
    this.audio.back()
  },
  refresh ($btn) {
    this.audio.refreshBackButton($btn)
  },
})
