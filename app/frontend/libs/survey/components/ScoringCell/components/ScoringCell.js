import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ScoringCell.scss'

const defaultValue = '1'
class ScoringCell extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
  }

  select = (e) => {
    const { value, onChange } = this.props
    if (!value && value !== 0) {
      onChange(defaultValue)
    }
    e.currentTarget.select()
  }

  render () {
    const { value, onChange } = this.props
    return (
      <input
        onFocus={this.select}
        onChange={onChange}
        placeholder="#"
        className={`${styles.ceil} ${value ? styles.ceilFill : styles.ceilEmpty}`}
        value={value || ''}
      />
    )
  }
}
export default ScoringCell
