import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/DataConfigurationStore'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export default class DataConfigurationModal extends Component {
  constructor (props) {
    super(props)
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  handleChangeValue = (event) => {
    store.dataConfiguration = event.currentTarget.value
    store.update()
  }

  close () {
    store.close()
  }

  save () {
    store.save()
  }

  render () {
    if (!store.opened) { return null }
    return (
      <Modal show keyboard={false} bsSize="lg">
        <Header>
          <Title>Data Report Configuration</Title>
        </Header>
        <Body>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={store.dataConfiguration}
            onChange={this.handleChangeValue}
            rows="10"
            style={{ width: '100%', display: 'inline-block' }}
          />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}
