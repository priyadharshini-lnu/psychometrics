import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import ConditionList from './ConditionList'
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
    if (!question.validation.message) {
      this.setState({ error: true })
    } else {
      this.setState({ error: false })
      question.update()
      close()
    }
  }

  cancel = () => {
    const { close } = this.props
    this.setState({ error: false })
    close()
  }

  changeErrorText = (e) => {
    const { question } = this.props
    question.validation.message = e.currentTarget.value
    this.forceUpdate()
  }

  renderConditions () {
    const { question } = this.props
    const { error } = this.state
    return (
      <div>
        <div>Validation will pass if the following condition is met:</div>
        <ConditionList {...this.props} />
        <div className={`${styles.errMessage} ${error ? styles.error : ''}`}>
          Type an error message to display on failure:
        </div>
        <input
          type="text"
          className="form-control"
          value={question.validation.message}
          onChange={this.changeErrorText}
        />
      </div>
    )
  }

  render () {
    return (
      <Modal show bsSize="lg" keyboard={false}>
        <Header>
          <Title>Choice Text</Title>
        </Header>
        <Body>
          {this.renderConditions()}
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
