import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import styles from './EndOfAssessmentModal.scss'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class EndOfAssessmentModal extends Component {
  state = {
    showUniqueId: false,
    messageType: 'Default',
    message: '',
  }

  componentDidMount () {
    const { flowElement } = this.props
    this.setState(state => ({ ...state, ...flowElement.props }))
  }

  changeMessageType = (e) => {
    this.setState({ messageType: e.currentTarget.value })
  }

  changeOptions = (e) => {
    this.setState({ showUniqueId: e.currentTarget.checked })
  }

  changeMessage = (e) => {
    this.setState({ message: e.currentTarget.value })
  }

  save = () => {
    const { flowElement, close } = this.props
    flowElement.props = this.state
    close()
  }

  render () {
    const { close } = this.props
    const {
      showUniqueId,
      messageType,
      message,
    } = this.state
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>End Of Assessment - Options</Title>
        </Header>
        <Body>
          <div>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" onChange={this.changeOptions} checked={!!showUniqueId} />
              Show Unique Identifier to respondents (for anonymous surveys)
            </label>
          </div>
          <hr />
          <div>
            <label key="default" style={{ display: 'block' }}>
              <input
                checked={messageType === 'Default'}
                onChange={this.changeMessageType}
                value="Default"
                type="radio"
                name="message"
              />
              Default end of assessment message.
            </label>
            <label key="Custom">
              <input
                checked={messageType === 'Custom'}
                onChange={this.changeMessageType}
                type="radio"
                value="Custom"
                name="message"
              />
              Custom end of assessment message...
            </label>
            {messageType === 'Custom' && (
            <div>
              <textarea
                value={message}
                className={styles.messageTextArea}
                onChange={this.changeMessage}
              />
            </div>
            )}
          </div>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default EndOfAssessmentModal
