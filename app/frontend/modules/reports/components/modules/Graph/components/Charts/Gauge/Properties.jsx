import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { ColorPicker } from '~/glint'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'

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

  changeMaxValue = (val) => {
    const { model } = this.props
    model.props.maxValue = val
    this.update()
  }

  changeColorProperty = (propertyName, color) => {
    const { model } = this.props
    model.props[propertyName] = color
    this.update()
  }

  render () {
    const { model } = this.props
    const {
      speedometerBackgroundColor, speedometerMainColor, labelVerticalPosition, speedometerSize, maxValue,
    } = model.props
    return (
      <div>
        <div className={styles.block}>
          Main Color
          <ColorPicker
            value={speedometerMainColor}
            getValueInHexFormat
            onChange={color => this.changeColorProperty('speedometerMainColor', color)}
          />
        </div>
        <div className={styles.block}>
          Background Color
          <ColorPicker
            getValueInHexFormat
            value={speedometerBackgroundColor}
            onChange={color => this.changeColorProperty('speedometerBackgroundColor', color)}
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
        <hr className={styles.divider} />
        <div className={styles.block}>
          Max Value
          <ChoicesInput
            value={parseInt(maxValue, 10) || 6}
            onChange={this.changeMaxValue}
            minValue={0}
            maxValue={1000}
          />
        </div>
      </div>
    )
  }
}

export default Properties
