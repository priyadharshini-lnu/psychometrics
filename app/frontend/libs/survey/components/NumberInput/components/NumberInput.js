import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import styles from './NumberInput.scss'

const MIN_VALUE = 0.0
const MAX_VALUE = 1.0
const DEFAULT_STEP = 0.1

class NumberInput extends Component {
  static propTypes = {
    value: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    step: PropTypes.number,
    name: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  getMinValue = () => {
    const { minValue } = this.props
    return minValue || MIN_VALUE
  }

  getMaxValue = () => {
    const { maxValue } = this.props
    return maxValue || MAX_VALUE
  }

  getStep = () => {
    const { step } = this.props
    return step || DEFAULT_STEP
  }

  updateModel = (val) => {
    const { onChange, name } = this.props
    onChange && onChange(name, val)
  }

  change = (e) => {
    if (!e.currentTarget.value.match(/\D/)) {
      let value = parseFloat(e.currentTarget.value)
      if (isNaN(value)) {
        value = this.getMinValue()
      } else {
        value = value < this.getMaxValue() ? value : this.getMaxValue()
      }
      this.updateModel(value)
    }
  }

  isNumber = val => !isNaN(parseFloat(val)) && isFinite(val)

  increment = () => {
    let { value } = this.props
    value += this.getStep()
    value = value < this.getMaxValue() ? value : this.getMaxValue()
    this.updateModel(value)
  }

  decrement = () => {
    let { value } = this.props
    value -= this.getStep()
    value = value < this.getMinValue() ? this.getMinValue() : value
    this.updateModel(value)
  }

  render () {
    const { value, label } = this.props
    const val = this.isNumber(value) ? value : this.getMinValue()

    return (
      <div className={styles.inputContainer}>
        <div className={styles.label}>{label}</div>
        <div className={styles.numberInput}>
          <a className={cs(styles.control, { disabled: value === MIN_VALUE })} onClick={this.decrement}>
            <span className={`fa fa-minus ${styles.icon}`} />
          </a>
          <input onChange={this.change} value={val} className={`from-control ${styles.input}`} />
          <a className={cs(styles.control, { disabled: value === MAX_VALUE })} onClick={this.increment}>
            <span className={`fa fa-plus ${styles.icon}`} />
          </a>
        </div>
      </div>
    )
  }
}

export default NumberInput
