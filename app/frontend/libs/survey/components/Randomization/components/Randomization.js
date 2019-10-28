import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import store from 'store/RandomizationStore'
import styles from './Randomization.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export class Randomization extends Component {
  state = {}

  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.handleStoreChange())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  handleStoreChange = () => {
    if (store.model) {
      this.setState({
        type: store.model.props.randomization.type,
        questions: store.model.props.randomization.questions || '',
      })
    } else {
      this.forceUpdate()
    }
  }

  handleChangeType = (e) => {
    this.setState({ type: e.currentTarget.value })
  }

  handleChangeQuestions = (e) => {
    this.setState({ questions: Math.abs(parseInt(e.currentTarget.value, 10)) || '' })
  }

  save = () => {
    const { type, questions } = this.state
    if (type === 'Some' && !questions) {
      NotificationDispatcher.notify({ level: 'error', message: 'You must enter a value' })
    } else {
      store.save(this.state)
    }
  }

  close = () => {
    store.close()
  }

  render () {
    const { model } = store
    const { type, questions } = this.state
    if (!model) { return null }
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>
            {_.capitalize(store.entityName)}
            {' '}
            Randomization
          </Title>
        </Header>
        <Body>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'No'}
              type="radio"
              value="No"
              onChange={this.handleChangeType}
            />
            {' '}
            No Randomization
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'All'}
              type="radio"
              value="All"
              onChange={this.handleChangeType}
            />
            {' '}
            Randomize the order of all
            {store.entityName}
            s
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Some'}
              type="radio"
              value="Some"
              onChange={this.handleChangeType}
            />
            {' '}
            Present only
            <input
              value={questions}
              onChange={this.handleChangeQuestions}
              className={styles.questionInput}
              disabled={type !== 'Some'}
            />
            of total
            {' '}
            {store.entityName}
            s
          </label>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default Randomization
