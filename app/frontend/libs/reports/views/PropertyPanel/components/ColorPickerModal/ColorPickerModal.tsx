import React from 'react'
import { SketchPicker } from 'react-color'
import styles from './styles.scss'
import { Close, ChangeColor, Color } from '../../../../core/temp/colorPicker'

interface Props {
  isOpen: boolean
  closePicker: Close
  changeColor: ChangeColor
  color: Color
  onComplete: null | undefined | ((color: Color) => void)
  onChange: null | undefined | ((color: Color) => void)
}

const ColorPickerModal: React.FC<Props> = ({
  isOpen, closePicker, changeColor, onComplete, onChange, color,
}) => {
  const handleChange = (newColor: Color) => {
    // sometimes SketchPicker triggers the event twice
    if (color === newColor) return

    changeColor(newColor)
    onChange && onChange(newColor)
  }

  if (!isOpen) return null

  return (
    <div className={styles.popover}>
      <div className={styles.cover} onClick={closePicker} />
      <SketchPicker onChangeComplete={onComplete} color={color} onChange={handleChange} />
    </div>
  )
}

export default ColorPickerModal
