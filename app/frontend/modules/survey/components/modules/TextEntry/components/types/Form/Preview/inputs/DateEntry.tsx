import React from 'react'
import { DatePicker } from 'antd'
import moment, { Moment } from 'moment'
import { Question } from '../../interfaces'

const FORMAT = 'YYYY-MM-DD'

interface Props {
  name: string
  model: Question
  index: number
  readOnly: boolean
  onChange: (i: number, value: string) => void
}

const DateEntry: React.FC<Props> = ({
  onChange, model: { result: { answers } }, index, readOnly,
}) => {
  const { value } = answers[index]

  const handleOnChange = (date: Moment | null): void => {
    const newValue = date ? date.format(FORMAT) : ''
    onChange(index, newValue)
  }

  const dateValue = value ? moment(value, FORMAT) : moment(moment.now())

  return (
    <DatePicker
      disabled={readOnly}
      allowClear={false}
      format="YYYY-MM-DD"
      onChange={handleOnChange}
      value={dateValue}
    />
  )
}

export default DateEntry
