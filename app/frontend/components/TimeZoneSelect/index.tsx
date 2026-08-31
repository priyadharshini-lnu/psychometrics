import React, { useState, useEffect } from 'react'
import { Select, SelectProps } from 'antd'
import { useTimezones } from '~/hooks/useTimezones'

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

  // `options` (not children) lets rc-virtual-list render ~10 rows instead of all 418.
  return (
    <Select
      className="w-100"
      showSearch
      value={selectedTimeZone}
      onChange={handleChange}
      options={timezoneOptions}
      filterOption={(input, option) => `${option?.value ?? ''}`.toLowerCase().includes(input.toLowerCase())}
      {...props}
    />
  )
}

export default TimeZoneSelect
