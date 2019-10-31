import _ from 'lodash'
import React, { Component } from 'react'
import Socket from 'cable'
import { Modal } from 'react-bootstrap'
import store from 'store/CreateByTemplateStore'
import Async from 'react-select/async'

const {
  Header, Body, Footer, Title,
} = Modal


export class CreateByTemplate extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  save = () => {
    const method = `create${store.entityName}`
    store[method]()
  }

  close = () => {
    store.close()
  }

  loadOptions = (input, callback) => {
    Socket.socket().perform(`${store.entityName.toLowerCase()}_filter`,
      { q: input, without_notification: true }, (data) => {
        callback(null, { options: data })
      })
  }

  changeSelectValue = (value) => {
    store.setTemplate(value)
    this.forceUpdate()
  }

  render () {
    const { entityName } = store
    if (!entityName) { return null }
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>
Copy
            {_.capitalize(store.entityName)}
            {' '}
From Template
          </Title>
        </Header>
        <Body>
          <Async
            value={store.template}
            loadOptions={this.loadOptions}
            onChange={this.changeSelectValue}
            backspaceRemoves={false}
            autosize={false}
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

export default CreateByTemplate
