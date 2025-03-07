import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import {
  Checkbox, Input, Radio, Form,
} from 'antd'

import styles from './EndOfAssessmentModal.less'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal
const { I18n } = window
export class EndOfAssessmentModal extends Component {
  state = {
    showUniqueId: false,
    markAsInEligible: false,
    messageType: 'Default',
    message: '',
    completionStatusCode: null,
  }

  componentDidMount () {
    const { flowElement } = this.props
    this.setState(state => ({ ...state, ...flowElement.props }))
  }

  save = () => {
    const {
      flowElement, close, onUpdate,
    } = this.props
    flowElement.props = this.state
    onUpdate(flowElement)
    close()
  }

  render () {
    const { close } = this.props
    const {
      showUniqueId,
      markAsInEligible,
      messageType,
      message,
      completionStatusCode,
    } = this.state
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>End Of Assessment - Options</Title>
        </Header>
        <Body>
          <div>
            <Checkbox
              checked={showUniqueId}
              onChange={() => this.setState({ showUniqueId: !showUniqueId })}
            >
              {I18n.t('assessments.flow.end_assessment_modal.show_uniq_identifier')}
            </Checkbox>
          </div>
          <div>
            <Checkbox
              checked={markAsInEligible}
              onChange={() => this.setState({ markAsInEligible: !markAsInEligible })}
            >
              {I18n.t('assessments.flow.end_assessment_modal.mark_as_ineligible')}
            </Checkbox>
          </div>
          <div className="mtm">
            <Form.Item label="Completion Status Code" labelCol={{ span: 24 }}>
              <Input
                value={completionStatusCode}
                className={styles.messageTextArea}
                onChange={e => this.setState({ completionStatusCode: e.currentTarget.value })}
              />
            </Form.Item>
          </div>
          <hr />
          <div>
            <Radio.Group onChange={e => this.setState({ messageType: e.target.value })} value={messageType}>
              <Radio value="Default">{I18n.t('assessments.flow.end_assessment_modal.default_message')}</Radio>
              <Radio value="Custom">{I18n.t('assessments.flow.end_assessment_modal.custom_message')}</Radio>
            </Radio.Group>
            {messageType === 'Custom' && (
              <div className="mtm">
                <Input.TextArea
                  value={message}
                  className={styles.messageTextArea}
                  onChange={e => this.setState({ message: e.currentTarget.value })}
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
