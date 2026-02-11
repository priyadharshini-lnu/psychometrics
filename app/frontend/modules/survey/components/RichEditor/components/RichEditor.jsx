import { useState, useEffect } from 'react'
import FroalaEditor from 'react-froala-wysiwyg'
import { Modal } from 'antd'
import store from '~/modules/survey/store'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import 'froala-editor/js/third_party/spell_checker.min.js'
import 'froala-editor/css/third_party/spell_checker.min.css'

import pipedText from '~/libs/Editor/commands/pipedText'

import config from './froalaConfig'

export const RichEditor = ({ value, onSave, close }) => {
  const [text, setText] = useState(value)

  useEffect(() => {
    pipedText(store)
  }, [])

  const saveText = () => {
    onSave(text)
    close()
  }


  return (
    <Modal
      focusable={{ trap: false }}
      width={1000}
      title="Choice Text"
      open
      okText="Save"
      cancelText="Cancel"
      onOk={saveText}
      onCancel={close}
    >
      <FroalaEditor config={config} model={text} onModelChange={value => setText(value)} />
    </Modal>
  )
}

export default RichEditor
