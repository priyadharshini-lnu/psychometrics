import React, { useEffect, useRef, useState } from 'react'
import 'codemirror/lib/codemirror.css'
import CodeMirror from 'codemirror'
import 'codemirror/mode/xml/xml'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import FroalaEditor from 'react-froala-wysiwyg'
import '~/libs/Editor/commands/rtlLtr'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import { isRtl } from '~/utils/locales'

interface Props {
  content: string
  handleContentChange: (value: string) => void
  type?: string | null
  details?: string | null
  className?: string
  withPipedText?: boolean
}

const { I18n } = window

export const EmailEditor: React.FC<Props> = ({
  content, handleContentChange, type, details, className, withPipedText = false,
}) => {
  const direction = isRtl(I18n?.currentLocale()) ? 'rtl' : 'ltr'

  const [isInitialized, setIsInitialized] = useState(false)
  const config = {
    iconsTemplate: 'font_awesome',
    imageUpload: false,
    imageOutputSize: true,
    codeMirror: CodeMirror,
    direction,
    placeholderText: I18n.t('administration.communications.form.message_body_placeholder'),
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
    ],
    toolbarButtons: [
      'bold',
      'italic',
      'underline',
      'strikeThrough',
      'subscript',
      'superscript',
      'textColor',
      'align',
      'rightToLeft',
      'leftToRight',
      'fontFamily',
      'fontSize',
      'formatOL',
      'formatUL',
      'indent',
      'outdent',
      'paragraphFormat',
      'paragraphStyle',
      'clearFormatting',
      'insertHR',
      'insertLink',
      'insertImage',
      'insertTable',
      'quote',
      'html',
      'fullscreen',
      'undo',
      'redo',
    ],
    saveParams: { type, details },
    heightMin: 250,
    heightMax: 500,
    key: 'DUA2yE2C2F1A6A3A2A3qYFd1UQRFQIVb1MSMc2IWPNe1IFg1yD4C3D2C1C4C1H1H4B1D2==',
    attribution: false,
    fontFamily: {
      'Arial,Helvetica,sans-serif': 'Arial',
      'Georgia,serif': 'Georgia',
      "'Times New Roman',Times,serif": 'Times New Roman',
      'Verdana,Geneva,sans-serif': 'Verdana',
    },
    tableStyles: {
      'email-table-no-border': 'No Border',
      'email-table-light-borders': 'Light Border',
      'email-table-dark-borders': 'Dark Border',
      'email-table-light-header': 'Light Header',
      'email-table-dark-header': 'Dark Header',
      'email-table-fullwidth': 'Full Width',
    },
    tableCellStyles: {
      'table-cell-header': 'Header',
      'fr-highlighted': 'Highlighted',
      'fr-thick': 'Thick',
    },
    toolbarSticky: false,
    pasteDeniedAttrs: ['style'],
  }

  withPipedText && config.toolbarButtons.unshift('pipedText')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)

  useEffect(() => {
    if (ref.current?.editor?.opts) {
      ref.current.editor.opts.saveParams = { type, details }
    }
  }, [type, details])

  useEffect(() => {
    async function initPlugins () {
      // Refer: https://github.com/froala/react-froala-wysiwyg/issues/410#issuecomment-2627465406
      // Import  Froala Editor plugin lazily;
      await import('froala-editor/js/plugins.pkgd.min')
      setIsInitialized(true)
    }
    if (!isInitialized) {
      initPlugins()
    }
  })

  return (
    <div className={className}>
      {isInitialized && <FroalaEditor ref={ref} config={config} model={content} onModelChange={handleContentChange} />}
    </div>
  )
}

export default EmailEditor
