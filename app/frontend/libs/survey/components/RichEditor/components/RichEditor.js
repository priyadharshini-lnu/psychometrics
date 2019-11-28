import React, { Component } from 'react'
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
  state = {
    value: '',
  }

  componentDidUpdate (prevProps) {
    const { show, value } = this.props
    if (value && show !== prevProps.show) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ value })
    }
  }

  onChange = (value) => {
    this.setState({ value })
  }

  save = () => {
    const { onSave, close } = this.props
    const { value } = this.state
    onSave(value)
    close()
  }

  render () {
    const { show, close } = this.props
    const { value } = this.state
    if (!show) { return null }

    return (
      <Modal show bsSize="lg" enforceFocus={false}>
        <Header>
          <Title>Choice Text</Title>
        </Header>
        <Body>
          <FroalaEditor config={config} model={value} onModelChange={this.onChange} />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default RichEditor
