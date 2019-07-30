import React, { useEffect } from 'react'

import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'

import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'

import './froalaCommands'
import FroalaEditor from 'react-froala-wysiwyg'

function Editor ({ content, handleContentChange, type }) {
  const config = {
    iconsTemplate: 'font_awesome',
    imageUpload: false,
    pluginsEnabled: ['image', 'link', 'fontFamily', 'lists', 'fontSize', 'colors', 'paragraphFormat', 'align', 'quote', 'table'],
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
    ],
    saveParams: { type },
    height: 220,
    key: '7MD3aC3A2C4B4D4A2xROKLJKYHROLDXDRE1b1YYGRi1Bd1C4F4B3H3G3A15A13A12C4C4==',
    attribution: false,
  }
  const ref = React.createRef()

  useEffect(() => {
    ref.current.editor.opts.saveParams = { type }
  }, [type])

  return (
    <div>
      <FroalaEditor ref={ref} tag="textarea" config={config} model={content} onModelChange={handleContentChange} />
    </div>
  )
}

export default Editor
