import { useRef, useEffect } from 'react'
import FroalaEditor from 'react-froala-wysiwyg'
import CodeMirror from '~/glint/components/ReactCodemirror/CodeMirrorCompat'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import events from './events'
import '~/libs/Editor/commands/rtlLtr'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import { isRtl } from '~/utils/locales'
import { FROALA } from '~/constants/froala.ts'

function Editor ({
  content, handleContentChange, type, details, className, withPipedText = false, configOverrides = {},
}) {
  const { I18n } = window
  const direction = isRtl(I18n?.currentLocale()) ? 'rtl' : 'ltr'

  let config = {
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
    key: FROALA,
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
    direction,
  }

  config = { ...config, ...configOverrides }

  withPipedText && config.toolbarButtons.unshift('pipedText')

  const ref = useRef(null)

  useEffect(() => {
    if (ref.current?.editor?.opts) {
      ref.current.editor.opts.saveParams = { type, details }
    }
  }, [type, details])

  return (
    <div className={className}>
      <FroalaEditor ref={ref} config={config} model={content} onModelChange={handleContentChange} />
    </div>
  )
}

export default Editor
