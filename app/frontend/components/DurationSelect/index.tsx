import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { Form, TimePicker } from 'antd'

interface Props {
  value: string
  label?: string
  className?: string
  onChange(duration: number): void
}

const DurationSelect: React.FC<Props> = ({
  value,
  label = '',
  onChange,
  ...props
}) => {
  const format = 'HH:mm'
  const [duration, setDuration] = useState(value || 0)

  useEffect(() => {
    setDuration(value)
  }, [value])

  const handleChange = (_, timeString: string) => {
    const d = moment.duration(timeString).as('minutes')
    setDuration(d)
    onChange && onChange(d)
  }

  const asFormattedString = (val: number) => {
    const d = moment.duration(val, 'minutes')
    return [d.get('hours'), d.get('minutes')].join(':')
  }

  return (
    <Form.Item label={label}>
      <TimePicker
        format={format}
        onChange={handleChange}
        defaultValue={moment(asFormattedString(duration as number), format)}
        {...props}
      />
    </Form.Item>
  )
}

export default DurationSelect
