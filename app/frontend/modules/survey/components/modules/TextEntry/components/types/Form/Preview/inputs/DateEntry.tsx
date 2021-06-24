import React from 'react'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'

interface Props {
  value: string
  onChange: (value: string | null) => void
  dateFormat: string
  readOnly: boolean
}

export const DateEntry: React.FC<Props> = ({
  onChange,
  value,
  dateFormat,
  readOnly,
}) => {
  const handleAnswerChange = (value: Moment | null): void => {
    if (value) {
      onChange(value.format(dateFormat))
    } else {
      onChange(null)
    }
  }

  return (
    <DatePicker
      allowClear
      disabled={readOnly}
      format={dateFormat}
      value={value ? moment(value, dateFormat) : null}
      onChange={handleAnswerChange}
    />
  )
}
