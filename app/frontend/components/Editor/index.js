import React from 'react'

import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'

import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'

import './froalaCommands'
import FroalaEditor from 'react-froala-wysiwyg'
import PipedTextModal from './PipedTextModal'

const config = {
  iconsTemplate: 'font_awesome',
  imageUpload: false,
  pluginsEnabled: ['image', 'link', 'fontFamily', 'fontSize', 'colors', 'paragraphFormat', 'align', 'quote', 'table'],
  toolbarButtons: [
    'pipedText',
    'fontFamily',
    'fontSize',
    'textColor',
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'subscript',
    'superscript',
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
  ],
  height: 220,
}

function Editor ({ content, handleContentChange, type }) {
  const ref = React.createRef()

  return (
    <div>
      <FroalaEditor ref={ref} tag="textarea" config={config} model={content} onModelChange={handleContentChange} />
      <PipedTextModal editorRef={ref} type={type} />
    </div>
  )
}

export default Editor
