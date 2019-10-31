import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import ChoicesInput from 'rb/components/ChoicesInput'

class Properties extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  changeFactorsWidth = (value) => {
    const { model } = this.props
    model.props.factorsWidth = value
    this.update()
  }

  changeInnerCircleRadius = (value) => {
    const { model } = this.props
    model.props.innerCircleRadius = value
    this.update()
  }

  changeInnerCircleText = ({ currentTarget }) => {
    const { model } = this.props
    model.props.innerCircleText = currentTarget.value
    this.update()
  }

  render () {
    const { model } = this.props
    const { factorsWidth, innerCircleRadius, innerCircleText } = model.props
    return (
      <div className={styles.block}>
        Factors Width
        <ChoicesInput minValue={25} maxValue={50} value={factorsWidth} onChange={this.changeFactorsWidth} />
        <div className={styles.block}>
          Inner Radius
          <ChoicesInput minValue={5} maxValue={200} value={innerCircleRadius} onChange={this.changeInnerCircleRadius} />
        </div>
        <div className={styles.block}>
          Inner Text
          <input className="form-control" value={innerCircleText} onChange={this.changeInnerCircleText} />
        </div>
      </div>
    )
  }
}

export default Properties
