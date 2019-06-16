import React from 'react'
import 'font-awesome/css/font-awesome.css'

import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'

import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'

import FroalaEditor from 'react-froala-wysiwyg'

function Editor ({
  content,
  handleContentChange,
}) {
  const config = {
    toolbarButtons: {
      moreText: {
        buttons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
          'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'],
      },
      moreParagraph: {
        buttons: ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL',
          'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote'],
      },
      moreRich: {
        buttons: ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome',
          'specialCharacters', 'embedly', 'insertFile', 'insertHR'],
      },
      moreMisc: {
        buttons: ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
        align: 'right',
        buttonsVisible: 2,
      },
    },
    height: 220,
  }

  return (
    <div>
      <FroalaEditor tag="textarea" config={config} model={content} onModelChange={handleContentChange} />
    </div>
  )
}

export default Editor
