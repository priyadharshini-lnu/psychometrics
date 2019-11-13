import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ChoicesInput.scss'

const MIN_VALUE = 0
const MAX_VALUE = 300
class ChoicesInput extends Component {
  static propTypes = {
    model: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
  }

  getMinValue = () => {
    const { minValue } = this.props
    return minValue || MIN_VALUE
  }

  getMaxValue = () => {
    const { maxValue } = this.props
    return maxValue || MAX_VALUE
  }

  updateModel = (val) => {
    const { onChange } = this.props
    onChange && onChange(val)
  }

  change = (e) => {
    if (!e.currentTarget.value.match(/\D/)) {
      let value = parseInt(e.currentTarget.value, 10)
      if (_.isNaN(value)) {
        value = this.getMinValue()
      } else {
        value = value < this.getMaxValue() ? value : this.getMaxValue()
      }
      this.updateModel(value)
    }
  }

  inc = () => {
    const { model, value } = this.props
    let val = _.isNumber(value) ? value : model.props.choices
    val += 1
    val = val < this.getMaxValue() ? val : this.getMaxValue()
    this.updateModel(val)
  }

  dec = () => {
    const { model, value } = this.props
    let val = _.isNumber(value) ? value : model.props.choices
    val -= 1
    val = val < this.getMinValue() ? this.getMinValue() : val
    this.updateModel(val)
  }

  render () {
    const { model, value } = this.props
    const val = _.isNumber(value) ? value : model.props.choices
    return (
      <div className={styles.choices}>
        <a className={styles.choicesBtn} onClick={this.dec}>
          <span className={`fa fa-minus ${styles.choicesIcon}`} />
        </a>
        <input onChange={this.change} value={val} className={`from-control ${styles.input}`} />
        <a className={styles.choicesBtn} onClick={this.inc}>
          <span className={`fa fa-plus ${styles.choicesIcon}`} />
        </a>
      </div>
    )
  }
}

export default ChoicesInput
