import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { SketchPicker } from 'react-color'
import _ from 'lodash'
import store from 'rb/store/PropertyPanelStore'
import styles from './ColorPicker.scss'

class ColorPicker extends Component {
  static propTypes = {
    color: PropTypes.any.isRequired,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
  }

  constructor () {
    super()
    this.state = {
      displayColorPicker: false,
    }
  }

  handleChange = (color) => {
    const { onChange } = this.props
    onChange && onChange(color)
  }

  complete = (color) => {
    const { onComplete } = this.props
    onComplete && onComplete(color)
  }

  handleClick = () => {
    const { displayColorPicker } = this.state
    if (displayColorPicker) {
      store.popupClosed()
    } else {
      store.popupOpened()
    }
    this.setState({ displayColorPicker: !displayColorPicker })
  }

  handleClose = () => {
    store.popupClosed()
    this.setState({ displayColorPicker: false })
  }

  render () {
    const { color } = this.props
    const { displayColorPicker } = this.state
    const style = {
      background: _.isObject(color)
        ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
        : color,
    }

    return (
      <div>
        <div onClick={this.handleClick} className={styles.swatch}>
          <div className={styles.color} style={style} />
        </div>
        {displayColorPicker ? (
          <div className={styles.popover}>
            <div className={styles.cover} onClick={this.handleClose} />
            <SketchPicker onChangeComplete={this.complete} color={color} onChange={this.handleChange} />
          </div>
        ) : null}
      </div>
    )
  }
}

export default ColorPicker
