import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'store/EnfOfAssessmentOptionsStore'
import styles from './EndOfAssessmentModal.scss'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class EndOfAssessmentModal extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  close = () => {
    store.close()
  }

  changeMessageType = (e) => {
    store.flowElement.props.messageType = e.currentTarget.value
    this.forceUpdate()
  }

  changeOptions = (e) => {
    store.flowElement.props.showUniqueId = e.currentTarget.checked
    this.forceUpdate()
  }

  changeMessage = (e) => {
    store.flowElement.props.message = e.currentTarget.value
    this.forceUpdate()
  }

  save = () => {
    store.save()
  }

  render () {
    if (!store.flowElement) { return null }
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>End Of Assessment - Options</Title>
        </Header>
        <Body>
          <div>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" onChange={this.changeOptions} checked={!!store.flowElement.props.showUniqueId} />
            Show Unique Identifier to respondents (for anonymous surveys)
            </label>
          </div>
          <hr />
          <div>
            <label key="default" style={{ display: 'block' }}>
              <input
                checked={store.flowElement.props.messageType === 'Default'}
                onChange={this.changeMessageType}
                value="Default"
                type="radio"
                name="message"
              />
Default end of assessment message.
            </label>
            <label key="Custom">
              <input
                checked={store.flowElement.props.messageType === 'Custom'}
                onChange={this.changeMessageType}
                type="radio"
                value="Custom"
                name="message"
              />
            Custom end of assessment message...
            </label>
            {store.flowElement.props.messageType === 'Custom' && (
            <div>
              <textarea
                value={store.flowElement.props.message}
                className={styles.messageTextArea}
                onChange={this.changeMessage}
              />
            </div>
            )}
          </div>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default EndOfAssessmentModal
