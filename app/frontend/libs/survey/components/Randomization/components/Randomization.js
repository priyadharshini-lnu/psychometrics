import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import NotificationDispatcher from 'dispatchers/NotificationDispatcher'
import styles from './Randomization.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export class Randomization extends Component {
  state = {}

  componentDidUpdate = (prevProps) => {
    const { model } = this.props
    if (model && prevProps.model !== model) {
      this.setState({
        type: model.props.randomization.type,
        questions: model.props.randomization.questions || '',
      })
    }
  }

  handleChangeType = (e) => {
    this.setState({ type: e.currentTarget.value })
  }

  handleChangeQuestions = (e) => {
    this.setState({ questions: Math.abs(parseInt(e.currentTarget.value, 10)) || '' })
  }

  save = () => {
    const {
      entityName, model, close, updateBlockProps,
    } = this.props
    const { type, questions } = this.state
    if (type === 'Some' && !questions) {
      NotificationDispatcher.notify({ level: 'error', message: 'You must enter a value' })
    } else {
      if (entityName === 'choice') {
        model.props.randomization = this.state
        model.update()
      } else {
        updateBlockProps(model, { randomization: this.state })
      }
      close()
    }
  }

  render () {
    const { show, close, entityName } = this.props
    if (!show) { return null }
    const { type, questions } = this.state
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>
            {_.capitalize(entityName)}
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
            {entityName}
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
            {entityName}
            s
          </label>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default Randomization
