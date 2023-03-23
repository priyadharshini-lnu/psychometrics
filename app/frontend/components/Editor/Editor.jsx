import { createRef, useEffect } from 'react'
import 'codemirror/lib/codemirror.css'
import CodeMirror from 'codemirror'
import 'codemirror/mode/xml/xml'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import FroalaEditor from 'react-froala-wysiwyg'
import events from './events'
import '~/libs/Editor/commands/rtlLtr'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'

function Editor ({
  content, handleContentChange, type, details, className, withPipedText = false,
}) {
  const config = {
    iconsTemplate: 'font_awesome',
    imageUpload: false,
    codeMirror: CodeMirror,
    pluginsEnabled: [
      'image',
      'link',
      'fontFamily',
      'lists',
      'fontSize',
      'colors',
      'paragraphFormat',
      'align',
      'quote',
      'table',
      'codeView',
      'codeBeautifier',
      'fullscreen',
      'video',
      'embedMedia',
      'audio',
    ],
    toolbarButtons: [
      'fontFamily',
      'fontSize',
      'textColor',
      'bold',
      'italic',
      'underline',
      'strikeThrough',
      'subscript',
      'superscript',
      'formatOL',
      'formatUL',
      'rightToLeft',
      'leftToRight',
      'paragraphFormat',
      'align',
      'outdent',
      'indent',
      'quote',
      'insertLink',
      'insertImage',
      'insertTable',
      'insertHR',
      'clearFormatting',
      'help',
      'undo',
      'redo',
      'html',
      'fullscreen',
      'insertVideo',
      'embedMedia',
      'insertAudio',
    ],
    saveParams: { type, details },
    heightMin: 250,
    heightMax: 500,
    key: 'DUA2yE2C2F1A6A3A2A3qYFd1UQRFQIVb1MSMc2IWPNe1IFg1yD4C3D2C1C4C1H1H4B1D2==',
    attribution: false,
    tableStyles: {
      'table-no-border': 'No Border',
      'table-minimal-hr': 'Minimal',
      'table-compact': 'Compact',
      'table-full-width': 'Full Width',
      'fr-dashed-borders': 'Dashed Borders',
      'fr-alternate-rows': 'Alternate Rows',
    },
    tableCellStyles: {
      'table-cell-header': 'Header',
      'fr-highlighted': 'Highlighted',
      'fr-thick': 'Thick',
    },
    imageStyles: {
      'zoom-image': 'Zoom Image',
    },
    toolbarSticky: false,
    videoInsertButtons: ['videoByURL', '|', 'videoEmbed'],
    pasteDeniedAttrs: ['style'],
    events: {
      'video.codeError': function (code) {
        events.video_code_error(this, code)
      },
      'video.linkError': function (link) {
        events.video_link_error(this, link)
      },
    },
  }

  withPipedText && config.toolbarButtons.unshift('pipedText')

  const ref = createRef()

  useEffect(() => {
    ref.current.editor.opts.saveParams = { type, details }
  }, [type, details])

  return (
    <div className={className}>
      <FroalaEditor ref={ref} config={config} model={content} onModelChange={handleContentChange} />
    </div>
  )
}

export default Editor
