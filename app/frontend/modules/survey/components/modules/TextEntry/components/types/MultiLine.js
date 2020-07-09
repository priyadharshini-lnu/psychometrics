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

  render () {
    const { model: { props } } = this.props
    return (
      <div>
        <textarea className={`form-control ${styles.singleLine}`} rows={props.type === 'MultiLine' ? 3 : 6} />
      </div>
    )
  }
}
