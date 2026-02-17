import React, { useState, useEffect } from 'react'
import { Select, SelectProps } from 'antd'
import { useTimezones } from '~/hooks/useTimezones'

const { Option } = Select
interface Props extends SelectProps {
  value?: string
  label?: string
  onChange?(zone: string): void
}

const TimeZoneSelect: React.FC<Props> = ({
  value,
  onChange,
  ...props
}) => {
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>()
  const timezoneOptions = useTimezones(value)

  useEffect(() => {
    setSelectedTimeZone(value)
  }, [value])

  const handleChange = (tz) => {
    setSelectedTimeZone(tz)
    onChange?.(tz)
  }

  return (
    <Select
      className="w-100"
      showSearch
      value={selectedTimeZone}
      onChange={handleChange}
      filterOption={(input, option) => option?.key?.toLowerCase().includes(input.toLowerCase())
      }
      {...props}
    >
      {timezoneOptions.map(option => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  )
}

export default TimeZoneSelect
