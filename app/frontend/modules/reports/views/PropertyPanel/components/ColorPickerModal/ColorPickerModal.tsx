import React from 'react'
import _ from 'lodash'
import { ColorState, SketchPicker } from 'react-color'
import { rgba2hex } from 'utils/color'
import styles from './styles.scss'
import { Close, ChangeColor, Color } from '../../../../core/temp/colorPicker'

interface Props {
  isOpen: boolean
  closePicker: Close
  changeColor: ChangeColor
  color: Color
  onComplete: null | undefined | ((color: ColorState) => void)
  onChange: null | undefined | ((color: ColorState) => void)
}

const ColorPickerModal: React.FC<Props> = ({
  isOpen, closePicker, changeColor, onComplete, onChange, color,
}) => {
  const handleChange = _.debounce((newColor: ColorState) => {
    newColor.hex = rgba2hex(newColor.rgb)
    onChange && onChange(newColor)
  }, 200)

  const handleComplete = (newColor: ColorState) => {
    newColor.hex = rgba2hex(newColor.rgb)
    changeColor(newColor)
    onComplete && onComplete(newColor)
  }

  if (!isOpen) return null

  return (
    <div className={styles.popover}>
      <div className={styles.cover} onClick={closePicker} />
      <SketchPicker
        className={styles.picker}
        onChangeComplete={handleComplete}
        color={color}
        onChange={handleChange}
      />
    </div>
  )
}

export default ColorPickerModal
