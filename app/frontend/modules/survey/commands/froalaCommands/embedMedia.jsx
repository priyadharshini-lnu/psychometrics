import FroalaEditor from 'froala-editor'
import ReactDOM from 'react-dom'
import EmbedMediaComponent from './EmbedMediaComponent'

Object.assign(FroalaEditor.POPUP_TEMPLATES, {
  'embedMedia.insert': '[_EMBED_MEDIA_CONTAINER_]',
})

export default function (editor) {
  function showInsertPopup () {
    const $btn = editor.$tb.find('.fr-command[data-cmd="embedMedia"]')
    let $popup = editor.popups.get('embedMedia.insert')
    if (!$popup) {
      $popup = initInsertPopup()
    } else {
      renderPopupContent()
    }

    if (!$popup.hasClass('fr-active')) {
      editor.popups.refresh('embedMedia.insert')
      editor.popups.setContainer('embedMedia.insert', editor.$tb)
      const editor$button$getPos = editor.button.getPosition($btn)
      const { left } = editor$button$getPos
      const { top } = editor$button$getPos

      editor.popups.show('embedMedia.insert', left, top, $btn.outerHeight())
    }
  }

  function initInsertPopup () {
    const template = {
      embed_media_container: "<div id='fr-embeded-media-container'>Loading....</div>",
    }

    const $popup = editor.popups.create('embedMedia.insert', template)

    renderPopupContent()

    return $popup
  }

  function renderPopupContent () {
    ReactDOM.render(<EmbedMediaComponent editor={editor} />, document.getElementById('fr-embeded-media-container'))
  }

  return {
    showInsertPopup,
  }
}

FroalaEditor.DefineIcon('embedMedia', { NAME: 'play-circle' })

FroalaEditor.RegisterCommand('embedMedia', {
  title: 'embedMedia',
  focus: false,
  undo: false,
  refreshAfterCallback: false,
  popup: true,
  callback () {
    this.embedMedia.showInsertPopup()
  },
  plug: 'embedMedia',
})
