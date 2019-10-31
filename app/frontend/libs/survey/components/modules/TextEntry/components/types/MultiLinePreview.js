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

  render () {
    const { readOnly, model: { props, result } } = this.props
    const value = (result.answers[0] && result.answers[0].value) || ''
    return (
      <div>
        <textarea
          disabled={readOnly}
          onChange={this.changeAnswer}
          value={value}
          className={`form-control ${styles.singleLine}`}
          rows={props.type === 'MultiLine' ? 3 : 6}
        />
      </div>
    )
  }
}
