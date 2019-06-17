import React from 'react'

import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'

import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'

import './froala_commands'
import FroalaEditor from 'react-froala-wysiwyg'

function Editor ({
  content,
  handleContentChange,
}) {
  const config = {
    iconsTemplate: 'font_awesome',
    imageUpload: false,
    pluginsEnabled: ['image', 'link', 'fontFamily', 'fontSize', 'paragraphFormat', 'align', 'quote', 'table'],
    toolbarButtons: [
      'fontFamily', 'fontSize', 'textColor',
      'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
      'rightToLeft', 'leftToRight',
      'paragraphFormat', 'align', 'outdent', 'indent', 'quote',
      'insertLink', 'insertImage', 'insertTable',
      'insertHR', 'clearFormatting',
      'help', 'undo', 'redo'],
    height: 220,
  }

  return (
    <div>
      <FroalaEditor tag="textarea" config={config} model={content} onModelChange={handleContentChange} />
    </div>
  )
}

export default Editor
