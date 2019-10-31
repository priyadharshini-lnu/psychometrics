import React, { Component } from 'react'
import store from 'store/CustomValidationStore'
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

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  save = () => {
    const { model } = store
    if (!model.validation.message) {
      this.setState({ error: true })
    } else {
      this.setState({ error: false })
      store.save()
    }
  }

  cancel = () => {
    this.setState({ error: false })
    store.cancel()
  }

  changeErrorText = (e) => {
    const { model } = store
    model.validation.message = e.currentTarget.value
    this.forceUpdate()
  }

  renderConditions () {
    const { error } = this.state
    return (
      <div>
        <div>Validation will pass if the following condition is met:</div>
        <ConditionList />
        <div className={`${styles.errMessage} ${error ? styles.error : ''}`}>
          Type an error message to display on failure:
        </div>
        <input
          type="text"
          className="form-control"
          value={store.model.validation.message}
          onChange={this.changeErrorText}
        />
      </div>
    )
  }

  render () {
    const { model } = store
    if (!model) { return null }
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
