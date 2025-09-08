import {
  ChangeEvent, KeyboardEvent, useState, useEffect, forwardRef,
} from 'react'
import { InputProps } from 'antd/lib/input/Input'
import { Flex, Typography, InputRef } from 'antd'
import { MaskedInput } from '~/glint'

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const { I18n } = window
interface Props extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string | number
  onChange?: (value: number) => void
  masked?: boolean
  maxDuration?: number,
}

const InputDuration = forwardRef<InputRef, Props>(({
  value = '',
  onChange,
  masked = false,
  maxDuration,
  ...restInputProps
}, ref) => {
  const [inputValue, setInputValue] = useState(maskUp(value))
  const [showWarning, setShowWarning] = useState(false)

  const maskAndReturnIntValue = () => {
    let maskedValue = maskUp(inputValue)
    if (maxDuration && convertToInt(maskedValue) > maxDuration) {
      maskedValue = maskUp(maxDuration)
      handleShowWarning()
    }

    if (maskedValue !== inputValue) {
      setInputValue(maskedValue)
      onChange && onChange(convertToInt(maskedValue))
    } else {
      onChange && onChange(convertToInt(inputValue))
    }
  }

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const {
      target: { value },
    } = event
    if (maxDuration && convertToInt(value) > maxDuration) {
      setInputValue(maskUp(maxDuration))
      handleShowWarning()
    }
    setInputValue(value)
  }

  const handleShowWarning = () => {
    setShowWarning(true)
    const setTimeoutId = setTimeout(() => {
      setShowWarning(false)
      clearTimeout(setTimeoutId)
    }, 5000)
  }

  const handleOnKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      maskAndReturnIntValue()
    }
  }


  useEffect(() => {
    setInputValue(maskUp(value))
  }, [value])

  return (
    <Flex vertical>
      <MaskedInput
        ref={ref}
        masked={masked}
        onBlur={maskAndReturnIntValue}
        onChange={handleOnChange}
        onKeyPress={handleOnKeyPress}
        value={inputValue}
        {...restInputProps}
      />
      {showWarning && maxDuration ? (
        <Typography.Text type="danger">
          {I18n.t('glint.input_duration.max_duration', { duration: maskUp(maxDuration) })}
        </Typography.Text>
      ) : null}
    </Flex>
  )
})

export const maskUp = (value: string | number): string => {
  const valueInNumbers = convertToInt(value)

  const hours = valueInNumbers % DAY
  const minutes = valueInNumbers % HOUR
  const seconds = valueInNumbers % MINUTE

  const duration = {
    d: valueInNumbers >= DAY ? Math.floor(valueInNumbers / DAY) : 0,
    h: hours > 0 ? Math.floor(hours / HOUR) : 0,
    m: minutes > 0 ? Math.floor(minutes / MINUTE) : 0,
    s: seconds,
  }

  const maskedValue = Object.keys(duration)
    .reduce((prev, key) => {
      const durationValue = duration[key]
      return durationValue ? `${prev} ${durationValue}${key}` : prev
    }, '')
    .trimStart()

  return maskedValue
}

export const convertToInt = (value: string | number): number => {
  if (typeof value === 'number' || /^[0-9 ]+$/.test(value)) {
    return parseInt(`${value}`, 10)
  }

  const match = value && value.length !== 0
    ? value.matchAll(/(?<value>\d*)(?<unit>\w)/gi)
    : []

  const volumes = {
    d: DAY,
    h: HOUR,
    m: MINUTE,
    s: 1,
  }

  // Ensure subsequent matches of same unit are filtered out, e.g. ['2d', '1d'] => ['2d']
  const uniqueMatches = [...match].reduce((prev, item, index) => {
    if (Object.keys(prev).find(prevKey => prev[prevKey][2] === item[2])) {
      return prev
    }

    return { ...prev, [index]: item }
  }, {})

  return Object.keys(uniqueMatches).reduce((prev, key) => {
    const unit = uniqueMatches[key][2]

    return unit.length && volumes[unit]
      ? prev + volumes[unit] * uniqueMatches[key][1]
      : prev
  }, 0)
}

export default InputDuration
