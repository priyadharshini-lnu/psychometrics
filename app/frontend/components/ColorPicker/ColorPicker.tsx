import React, { useState } from 'react'
import _ from 'lodash'
import { ColorResult, SketchPicker } from 'react-color'
import { rgba2hex } from 'utils/color'
import cs from 'classnames'
import styles from './styles.less'

interface Props {
  value?: string
  onComplete?: null | undefined | ((color: string) => void)
  onChange?: null | undefined | ((color: string) => void)
  swatchClass?: string
  defaultValue?: string
}

export const ColorPicker: React.FC<Props> = ({
  onComplete, onChange, value, swatchClass, defaultValue,
}) => {
  const [isOpen, setOpen] = useState(false)

  const handleChange = _.debounce((newColor: ColorResult) => {
    onChange?.(rgba2hex(newColor.rgb))
  }, 200)

  const handleComplete = (newColor: ColorResult) => {
    onComplete?.(rgba2hex(newColor.rgb))
  }

  const style = value || defaultValue ? { background: value || defaultValue } : undefined

  return (
    <>
      <div className="color-picker">
        <div onClick={() => setOpen(true)} className={cs(styles.swatch, swatchClass)}>
          <div className={styles.color} style={style} />
        </div>
      </div>
      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.cover} onClick={() => setOpen(false)} />
          <SketchPicker
            className={styles.picker}
            onChangeComplete={handleComplete}
            color={value || defaultValue}
            onChange={handleChange}
          />
        </div>
      )}
    </>
  )
}
