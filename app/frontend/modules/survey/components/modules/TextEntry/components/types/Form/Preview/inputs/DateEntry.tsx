import React from 'react'
import { DatePicker } from 'antd'
import dayjs from '~/utils/dayjs'

import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'

interface Props {
  value: string
  onChange: (value: string | null) => void
  dateFormat: string
  readOnly: boolean
  id?: string
}

export const DateEntry: React.FC<Props> = ({
  onChange,
  value,
  dateFormat,
  readOnly,
  id,
}) => {
  const handleAnswerChange = (value: dayjs.Dayjs | null): void => {
    if (value) {
      onChange(value.format(dateFormat))
    } else {
      onChange(null)
    }
  }

  const pickerMode = DATE_FORMAT_OPTIONS.find(
    dateFormatOption => dateFormatOption.value === dateFormat,
  )?.picker ?? 'date'

  return (
    <DatePicker
      id={id}
      allowClear
      disabled={readOnly}
      picker={pickerMode}
      format={dateFormat}
      value={value ? dayjs(value, dateFormat) : null}
      onChange={handleAnswerChange}
    />
  )
}
