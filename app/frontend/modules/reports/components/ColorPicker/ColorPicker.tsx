import React from 'react'
import { ColorResult, RGBColor } from 'react-color'
import styles from './styles.less'
import { Open } from '../../core/temp/colorPicker'

interface Props {
  openPicker: Open
  color: RGBColor | string
  onComplete?: null | undefined | ((color: ColorResult) => void)
  onChange: null | undefined | ((color: ColorResult) => void)
}

const ColorPicker: React.FC<Props> = ({
  color, openPicker, onChange, onComplete,
}) => {
  const handleChange = (color: ColorResult) => {
    onChange && onChange(color)
  }

  const handleComplete = (color: ColorResult) => {
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
