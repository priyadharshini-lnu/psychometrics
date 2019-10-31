import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactSlider from 'react-slider'
import styles from './Slider.scss'

class Slider extends Component {
  static propTypes = {
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func,
  }

  setValue = (percent) => {
    const { minValue, maxValue, onChange } = this.props
    const value = minValue + percent * (maxValue - minValue) / 100
    onChange && onChange(value)
  }

  render () {
    const { minValue, maxValue, value } = this.props
    const val = (value - minValue) * 100 / (maxValue - minValue)
    return (
      <ReactSlider
        defaultValue={val}
        value={val}
        withBars
        className={styles.sliderContainer}
        barClassName={styles.bar}
        handleClassName={styles.handler}
        onChange={this.setValue}
        step={0.001}
      />
    )
  }
}

export default Slider
