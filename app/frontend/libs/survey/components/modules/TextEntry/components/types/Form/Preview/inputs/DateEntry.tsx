import React from 'react'
import { DatePicker } from 'antd'
import moment from 'moment'
import { Question } from '../../interfaces'

const FORMAT = 'YYYY-MM-DD'

interface Props {
  name: string
  model: Question
  index: number
  onChange: (i: number, value: string) => void
}

const DateEntry: React.FC<Props> = ({
  onChange, model: { result: { answers } }, index,
}) => {
  const { value } = answers[index]

  return (
    <DatePicker
      format="YYYY-MM-DD"
      value={value ? moment(value, FORMAT) : null}
      onChange={(e): void => onChange(index, e ? e.format(FORMAT) : '')}
    />
  )
}

export default DateEntry
