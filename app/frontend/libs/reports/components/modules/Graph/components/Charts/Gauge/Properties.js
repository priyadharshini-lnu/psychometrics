import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import ColorPicker from 'rb/components/ColorPicker'
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

  changeLabelPosition = (val) => {
    const { model } = this.props
    model.props.labelVerticalPosition = val
    this.update()
  }

  changeSize = (val) => {
    const { model } = this.props
    model.props.speedometerSize = `${val}%`
    this.update()
  }

  changeColorProperty = (propertyName, color) => {
    const { model } = this.props
    model.props[propertyName] = color.hex
    this.update()
  }

  render () {
    const { model } = this.props
    const {
      speedometerBackgroundColor, speedometerMainColor, labelVerticalPosition, speedometerSize,
    } = model.props
    return (
      <div>
        <div className={styles.block}>
          Main Color
          <ColorPicker
            color={speedometerMainColor}
            onChange={e => this.changeColorProperty('speedometerMainColor', e)}
            onComplete={this.update}
          />
        </div>
        <div className={styles.block}>
          Background Color
          <ColorPicker
            color={speedometerBackgroundColor}
            onChange={e => this.changeColorProperty('speedometerBackgroundColor', e)}
            onComplete={this.update}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Label Vertical Position
          <ChoicesInput
            value={labelVerticalPosition}
            onChange={this.changeLabelPosition}
            minValue={-200}
            maxValue={200}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.block}>
          Speedometer Size
          <ChoicesInput value={parseInt(speedometerSize, 10)} onChange={this.changeSize} minValue={40} maxValue={200} />
        </div>
      </div>
    )
  }
}

export default Properties
