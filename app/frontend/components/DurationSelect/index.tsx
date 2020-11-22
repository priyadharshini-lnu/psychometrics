import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { TimePicker } from 'antd'
import './styles.scss'

interface Props {
  value: string
  label?: string
  className?: string
  onChange(duration: number): void
}

const DurationSelect: React.FC<Props> = ({
  value,
  onChange,
  ...props
}) => {
  const format = 'HH:mm:ss'
  const [duration, setDuration] = useState(value || 0)

  useEffect(() => {
    setDuration(value)
  }, [value])

  const handleChange = (_, timeString: string) => {
    const [days, hours, minutes] = timeString.split(':').map(Number)
    const d = moment.duration({
      days,
      minutes,
      hours,
    }).as('minutes')

    setDuration(d)
    onChange && onChange(d)
  }

  const asFormattedString = (val: number) => {
    const d = moment.duration(val, 'minutes')
    return [d.get('days'), d.get('hours'), d.get('minutes')].join(':')
  }

  return (
    <TimePicker
      format={format}
      onChange={handleChange}
      placeholder="DD:HH:mm"
      defaultValue={moment(asFormattedString(duration as number), format)}
      popupClassName="picker-now-hidden"
      {...props}
    />
  )
}

export default DurationSelect
