import React, { useEffect, useRef } from 'react'
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
import { FROALA } from '~/constants/froala'

interface FroalaEditorRef extends FroalaEditor {
  editor?: {
    opts?: {
      saveParams?: Record<string, unknown>
    }
  }
}

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

  const ref = useRef<FroalaEditorRef>(null)
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
    key: FROALA,
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

export default EmailEditor
