import React, { useState, useEffect } from 'react'
import { Select, SelectProps } from 'antd'
import dayjs from '~/utils/dayjs'

const timeZones = Intl.supportedValuesOf('timeZone')
const { Option } = Select

interface Props extends SelectProps {
  value: string
  label?: string
  onChange(zone: string): void
}

const TimeZoneSelect: React.FC<Props> = ({
  value = Intl.DateTimeFormat().resolvedOptions().timeZone,
  onChange,
  ...props
}) => {
  const [selectedTimeZone, setSelectedTimeZone] = useState(value)

  useEffect(() => {
    setSelectedTimeZone(value)
  }, [value])

  const handleChange = (tz) => {
    setSelectedTimeZone(tz)
    onChange && onChange(tz)
  }

  let timezoneNames = timeZones.map(zone => ({ zone, label: `(GMT${dayjs().tz(zone).format('Z')}) ${zone}` }))
    .sort((a, b) => Number(dayjs().tz(a.zone).format('ZZ')) - Number(dayjs().tz(b.zone).format('ZZ')))
  const timezoneGuess = dayjs.tz.guess()

  if (timezoneGuess) {
    timezoneNames = [
      {
        zone: timezoneGuess,
        label: `(GMT${dayjs().tz(timezoneGuess).format('Z')}) ${timezoneGuess}`,
      },
      ...timezoneNames.filter(z => z.zone !== timezoneGuess),
    ]
  }

  return (
    <Select
      className="w-100"
      showSearch
      value={selectedTimeZone}
      onChange={handleChange}
      filterOption={(input, option) => (option?.key.toLowerCase().indexOf(input.toLowerCase()) >= 0)}
      {...props}
    >
      {timezoneNames.map(option => <Option key={option.zone} value={option.zone}>{option.label}</Option>)}
    </Select>
  )
}

export default TimeZoneSelect
