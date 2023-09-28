import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import FroalaEditor from 'react-froala-wysiwyg'
import store from '~/modules/survey/store'

import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import 'froala-editor/js/third_party/spell_checker.min.js'
import 'froala-editor/css/third_party/spell_checker.min.css'

import pipedText from '~/libs/Editor/commands/pipedText'

import config from './froalaConfig'

const {
  Header, Body, Footer, Title,
} = Modal

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
    <Modal show bsSize="lg" enforceFocus={false}>
      <Header>
        <Title>Choice Text</Title>
      </Header>
      <Body>
        <FroalaEditor config={config} model={text} onModelChange={value => setText(value)} />
      </Body>
      <Footer>
        <button className="btn btn-success" onClick={saveText}>
          Save
        </button>
        <button className="btn btn-danger" onClick={close}>
          Cancel
        </button>
      </Footer>
    </Modal>
  )
}

export default RichEditor
