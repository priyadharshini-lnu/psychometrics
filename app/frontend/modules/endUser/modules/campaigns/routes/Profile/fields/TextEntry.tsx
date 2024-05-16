import { FC } from 'react'
import { Input, DatePicker } from 'antd'
import dayjs from '~/utils/dayjs'

interface Props {
  field: {
    id: number
    props:{
      type: string
      choices: number
      choicesTexts: string[]
      dateFormat?: string
    }
  }
  locked: boolean
  value: string
  defaultValue: string
  onChange: (value:string) => void
}

export const TextEntry: FC<Props> = ({
  field, value, onChange, defaultValue, locked,
}) => {
  const change = (e) => {
    onChange(e.currentTarget.value)
  }

  const onDateChange = (date) => {
    onChange(date)
  }

  if (field.props.type === 'SingleLine') {
    return (
      <div>
        <Input value={value ?? defaultValue} onChange={change} disabled={locked} />
      </div>
    )
  }

  if (field.props.type === 'DateEntry') {
    return (
      <div>
        <DatePicker
          format={field.props.dateFormat || 'MMMM Do YYYY'}
          value={defaultValue ? dayjs(defaultValue) : undefined}
          onChange={date => onDateChange(date && date.format())}
        />
      </div>
    )
  }

  if (field.props.type === 'MultiLine') {
    return (
      <div>
        <Input.TextArea disabled={locked} rows={4} value={value ?? defaultValue} onChange={change} />
      </div>
    )
  }

  return null
}
