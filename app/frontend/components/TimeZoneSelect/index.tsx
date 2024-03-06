import React, { useState, useEffect } from 'react'
import { Select, SelectProps } from 'antd'
import { useTimezones } from '~/hooks/useTimezones'

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
  const timezoneOptions = useTimezones()

  useEffect(() => {
    setSelectedTimeZone(value)
  }, [value])

  const handleChange = (tz) => {
    setSelectedTimeZone(tz)
    onChange && onChange(tz)
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
      {timezoneOptions.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
    </Select>
  )
}

export default TimeZoneSelect
