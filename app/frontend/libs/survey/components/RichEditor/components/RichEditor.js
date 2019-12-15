import React, { Component } from 'react'
import store from 'store/RichEditorStore'
import { Modal } from 'react-bootstrap'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import FroalaEditor from 'react-froala-wysiwyg'
import 'commands/froalaCommands'
import config from './froalaConfig'


const {
  Header, Body, Footer, Title,
} = Modal

export class RichEditor extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentDidUpdate () {
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  onChange = (value) => {
    store.data = value
  }

  save = () => {
    store.save(store.data)
  }

  cancel = () => {
    store.model = null
    this.forceUpdate()
  }

  render () {
    const { model } = store
    if (!model) { return null }

    return (
      <Modal show bsSize="lg" enforceFocus={false}>
        <Header>
          <Title>Choice Text</Title>
        </Header>
        <Body>
          <FroalaEditor config={config} model={store.data} onModelChange={this.onChange} />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.cancel}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default RichEditor
