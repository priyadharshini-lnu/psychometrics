import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { SketchPicker } from 'react-color'
import _ from 'lodash'
import styles from './ColorPicker.scss'

export default function ColorPicker ({ onChange, onComplete, color }) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false)

  const handleChange = color => onChange && onChange(color)

  const complete = color => onComplete && onComplete(color)

  const handleClick = () => setDisplayColorPicker(!displayColorPicker)

  const handleClose = () => setDisplayColorPicker(false)

  const style = {
    background: _.isObject(color)
      ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
      : color,
  }

  return (
    <div>
      <div onClick={handleClick} className={styles.swatch}>
        <div className={styles.color} style={style} />
      </div>
      {displayColorPicker ? (
        <div className={styles.popover}>
          <div className={styles.cover} onClick={handleClose} />
          <SketchPicker onChangeComplete={complete} color={color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  )
}

ColorPicker.propTypes = {
  color: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  onComplete: PropTypes.func,
}
