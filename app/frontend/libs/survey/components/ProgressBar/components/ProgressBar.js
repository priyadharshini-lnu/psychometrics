import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ProgressBar.scss'

class ProgressBar extends Component {
  static propTypes = {
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    onClick: PropTypes.func,
  }

  setValue = (e) => {
    const { minValue, maxValue, onClick } = this.props
    const percent = e.nativeEvent.offsetX * 100 / e.currentTarget.clientWidth
    const value = minValue + percent * (maxValue - minValue) / 100
    onClick && onClick(value)
  }

  render () {
    const { value, minValue, maxValue } = this.props
    const width = `${(value - minValue) * 100 / (maxValue - minValue)}%`
    return (
      <div onClick={this.setValue} className={`progress ${styles.progress}`}>
        <div
          className={`progress-bar progress-bar-success ${styles.progressBar}`}
          style={{ width }}
        />
      </div>
    )
  }
}

export default ProgressBar
