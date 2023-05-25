import { Component } from 'react'
import PropTypes from 'prop-types'
import { ColorPicker } from '~/glint'
import { rgba2hex } from '~/utils/color'
import styles from '../ConditionalTextModal.less'

export class ConditionCollection extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeBg = (color) => {
    const { model } = this.props
    model.styles.backgroundColor = color
    this.forceUpdate()
  }

  changeBorder = (color) => {
    const { model } = this.props
    model.styles.borderColor = color
    this.forceUpdate()
  }

  render () {
    const { model } = this.props
    let { backgroundColor, borderColor } = model.styles
    backgroundColor = backgroundColor || {
      r: '238',
      g: '238',
      b: '238',
      a: '1',
    }

    borderColor = borderColor || {
      r: '170',
      g: '170',
      b: '170',
      a: '1',
    }

    const style = {
      width: '200px',
      height: '50px',
      backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`,
      border: '1px solid',
      borderColor: `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`,
    }

    return (
      <div>
        <div className={styles.stylesBlock}>
          and apply the following styles:
          <div style={style} />
          <div className={styles.row}>
            <div className={styles.block} style={{ position: 'relative' }}>
              Background Color
              <ColorPicker value={rgba2hex(backgroundColor)} colorPickerPosition="bottom" onChange={this.changeBg} />
            </div>
            <div className={styles.block} style={{ position: 'relative' }}>
              Border Color
              <ColorPicker value={rgba2hex(borderColor)} colorPickerPosition="bottom" onChange={this.changeBorder} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ConditionCollection
