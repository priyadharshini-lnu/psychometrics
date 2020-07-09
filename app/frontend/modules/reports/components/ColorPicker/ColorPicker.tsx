import React from 'react'
import styles from './styles.scss'
import { Open, Color } from '../../core/temp/colorPicker'

interface Props {
  openPicker: Open
  color: Color
  onComplete: null | undefined | ((color: Color) => void)
  onChange: null | undefined | ((color: Color) => void)
}

const ColorPicker: React.FC<Props> = ({
  color, openPicker, onChange, onComplete,
}) => {
  const handleChange = (color: Color) => {
    onChange && onChange(color)
  }

  const handleComplete = (color: Color) => {
    onComplete && onComplete(color)
  }

  const handleClick = () => {
    openPicker({ onChange: handleChange, onComplete: handleComplete, color })
  }

  const style = {
    background: typeof color === 'object' && color
      ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
      : color,
  }

  return (
    <div className="color-picker">
      <div onClick={handleClick} className={styles.swatch}>
        <div className={styles.color} style={style} />
      </div>
    </div>
  )
}

export default ColorPicker
