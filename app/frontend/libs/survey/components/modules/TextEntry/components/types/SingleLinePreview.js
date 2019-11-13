import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../TextEntry.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (e) => {
    const { model } = this.props
    model.result.answer(e.currentTarget.value)
    this.forceUpdate()
  }

  type () {
    const { model } = this.props
    return model.props.type === 'SingleLine' ? 'text' : 'password'
  }

  render () {
    const { model: { result }, readOnly } = this.props
    const value = (result.answers[0] && result.answers[0].value) || ''
    return (
      <div>
        <input
          disabled={readOnly}
          onChange={this.changeAnswer}
          value={value}
          className={`form-control ${styles.singleLine}`}
          type={this.type()}
        />
      </div>
    )
  }
}
