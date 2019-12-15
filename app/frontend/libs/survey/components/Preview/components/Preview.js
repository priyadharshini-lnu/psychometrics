import React, { Component } from 'react'
import { Previews } from 'components/modules'
import store from 'store/PreviewStore'
import { Modal } from 'react-bootstrap'
import styles from './Preview.scss'
// var {Header, Body, Footer, Title} = Modal

const {
  Header, Body, Footer, Title,
} = Modal

export default class Preview extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  close = () => {
    store.question.resetResult()
    store.question = null
    this.forceUpdate()
  }

  renderModulePreview () {
    const model = store.question
    const View = Previews[`${model.type}Preview`]
    return <View model={model} />
  }

  render () {
    const model = store.question
    if (!model) { return null }
    return (
      <Modal show dialogClassName={styles.modal} bsSize="large" keyboard={false}>
        <Header>
          <Title>Preview Question</Title>
        </Header>
        <Body style={{ height: '65vh', overflowY: 'scroll' }}>
          {this.renderModulePreview()}
        </Body>
        <Footer>
          <button className="btn btn-danger" onClick={this.close}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
