import React from 'react'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'

interface Props {
  value: string
  onChange: (value: string) => void
  dateFormat: string
  readOnly: boolean
}

export const DateEntry: React.FC<Props> = ({
  onChange,
  value,
  dateFormat,
  readOnly,
}) => {
  const handleOnChange = (date: Moment | null): void => {
    const newValue = date ? date.format(dateFormat) : ''
    onChange(newValue)
  }

  const dateValue = value ? moment(value, dateFormat) : moment(moment.now())

  return (
    <DatePicker
      disabled={readOnly}
      allowClear={false}
      format={dateFormat}
      onChange={handleOnChange}
      value={dateValue}
    />
  )
}
