import React from 'react'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'

import { getCorrectPickerFromDateFormat } from 'modules/survey/utils/date'

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
      picker={getCorrectPickerFromDateFormat(dateFormat)}
      format={dateFormat}
      value={value ? moment(value, dateFormat) : null}
      onChange={handleAnswerChange}
    />
  )
}
