import React, { Component } from 'react'
import { Previews } from 'components/modules'
import store from 'store/DefaultValueStore'
import { Modal } from 'react-bootstrap'
import styles from './DefaultValue.scss'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export default class extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  close = () => {
    store.model = null
    this.forceUpdate()
  }

  clear = () => {
    store.model.resetDefaultValues()
    this.forceUpdate()
  }

  save = () => {
    store.model.props.defaultValues = store.model.result.answers
    store.model.updateDefaultProps()
    store.model = null
    this.forceUpdate()
  }

  renderModulePreview () {
    const { model } = store
    const View = Previews[`${model.type}Preview`]
    return <View model={model} />
  }

  render () {
    const { model } = store
    if (!model) { return null }
    return (
      <Modal show dialogClassName={styles.modal} bsSize="large" keyboard={false}>
        <Header>
          <Title>Edit Default Choices</Title>
        </Header>
        <Body style={{ height: '65vh', overflowY: 'scroll' }}>
          {this.renderModulePreview()}
        </Body>
        <Footer>
          <button className="btn btn-default" style={{ float: 'left' }} onClick={this.clear}>Clear</button>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
