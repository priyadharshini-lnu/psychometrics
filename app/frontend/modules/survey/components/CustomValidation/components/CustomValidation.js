import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import uuid from 'uuid/v4'
import ConditionList from './ConditionList'
import Condition from '../../../models/QuestionCondition'
import styles from './CustomValidation.scss'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class CustomValidation extends Component {
  state = {
    error: false,
  }

  save = () => {
    const { question, close } = this.props
    if (_.some(question.validations, v => !v.message)) {
      this.setState({ error: true })
    } else {
      this.setState({ error: false })
      question.update()
      close()
    }
  }


  cancel = () => {
    const { question, close } = this.props
    if (!question.validation.message) {
      question.validation.type = 'None'
      question.update()
    }
    this.setState({ error: false })
    close()
  }

  changeErrorText = (validation, e) => {
    validation.message = e.currentTarget.value
    this.forceUpdate()
  }

  addValidation = () => {
    const { question } = this.props
    if (!question.validation.customValidations) {
      question.validation.customValidations = []
    }
    question.validation.customValidations = [...question.validation.customValidations, {
      uuid: uuid(),
      conditions: [new Condition({ subject: question.id })],
      message: '',
    }]
    this.forceUpdate()
  }

  removeValidation = (validation) => {
    const { question } = this.props
    question.validation.customValidations = _.filter(
      question.validation.customValidations, v => v.uuid !== validation.uuid,
    )
    this.forceUpdate()
  }

  renderConditions (validation, key) {
    const { error } = this.state
    return (
      <div className={styles.panel} key={key}>
        <div className={`btn fa fa-close ${styles.remove}`} onClick={() => this.removeValidation(validation)} />
        <div>Validation will pass if the following condition is met:</div>
        <ConditionList validation={validation} {...this.props} />
        <div className={`${styles.errMessage} ${error ? styles.error : ''}`}>
          Type an error message to display on failure:
        </div>
        <input
          type="text"
          className="form-control"
          value={validation.message}
          onChange={e => this.changeErrorText(validation, e)}
        />
      </div>
    )
  }

  render () {
    const { question: { validation: { customValidations } } } = this.props
    return (
      <Modal show bsSize="lg" keyboard={false}>
        <Header>
          <Title>Choice Text</Title>
        </Header>
        <Body>
          {customValidations && customValidations.map((validation, i) => this.renderConditions(validation, i))}
          <div className={styles.constrols}>
            <button className="btn btn-success" onClick={this.addValidation}>Add Validation</button>
          </div>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.cancel}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default CustomValidation
