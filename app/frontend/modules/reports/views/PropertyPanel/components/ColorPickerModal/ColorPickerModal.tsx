import React from 'react'
import _ from 'lodash'
import { ColorResult, SketchPicker, RGBColor } from 'react-color'
import { rgba2hex } from 'utils/color'
import styles from './styles.scss'
import { Close, ChangeColor } from '../../../../core/temp/colorPicker'

interface Props {
  isOpen: boolean
  closePicker: Close
  changeColor: ChangeColor
  color: RGBColor | string
  onComplete: null | undefined | ((color: ColorResult) => void)
  onChange: null | undefined | ((color: ColorResult) => void)
}

const ColorPickerModal: React.FC<Props> = ({
  isOpen, closePicker, changeColor, onComplete, onChange, color,
}) => {
  const handleChange = _.debounce((newColor: ColorResult) => {
    newColor.hex = rgba2hex(newColor.rgb)
    onChange && onChange(newColor)
  }, 200)

  const handleComplete = (newColor: ColorResult) => {
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
