import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../TextEntry.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeLabel = (i, text) => {
    const { model } = this.props
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text })
    this.forceUpdate()
  }

  type () {
    const { model } = this.props
    return model.props.type === 'SingleLine' ? 'text' : 'password'
  }

  render () {
    return (
      <div>
        <input className={`form-control ${styles.singleLine}`} type={this.type()} />
      </div>
    )
  }
}
