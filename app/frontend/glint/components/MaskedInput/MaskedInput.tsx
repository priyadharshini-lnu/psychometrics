import {
  ChangeEvent, FC, useState,
} from 'react'
import { Input } from 'antd'
import { InputProps } from 'antd/lib/input/Input'
import styles from './MaskedInput.less'

type Props = InputProps & {
  masked?: boolean
}

export const MaskedInput: FC<Props> = ({
  masked = false,
  onBlur,
  onChange,
  ...restInputProps
}) => {
  const [showMask, setShowMask] = useState(false)

  const handleOnBlur = (e) => {
    setShowMask(false)

    onBlur && onBlur(e)
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setShowMask(true)
    onChange && onChange(event)
  }

  return (
    <>
      {masked && showMask && (
        <div
          className={styles.mask}
          onClick={handleOnBlur}
        />
      )}
      <Input
        style={{ zIndex: (masked && showMask) ? 5001 : 'initial' }}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        onFocus={() => setShowMask(true)}
        {...restInputProps}
      />
    </>
  )
}
