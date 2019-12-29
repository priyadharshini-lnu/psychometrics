import React, { Component } from 'react'
import { Previews } from 'components/modules'
import { Modal } from 'react-bootstrap'
import styles from './DefaultValue.scss'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export default class extends Component {
  clear = () => {
    const { question } = this.props
    question.resetDefaultValues()
    this.forceUpdate()
  }

  save = () => {
    const { question, close } = this.props
    question.props.defaultValues = question.result.answers
    question.updateDefaultProps()
    close()
  }

  renderModulePreview () {
    const { question } = this.props
    const View = Previews[`${question.type}Preview`]
    return <View model={question} />
  }

  render () {
    const { show, close } = this.props
    if (!show) { return null }
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
          <button className="btn btn-danger" onClick={close}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
