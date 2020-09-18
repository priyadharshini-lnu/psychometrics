import React, { useState } from 'react'
import moment from 'moment-timezone'
import { Select } from 'antd'

const { Option } = Select

const options: Array<{ value: string, label: string }> = []

moment.tz
  .names()
  .reduce(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      memo: { [propName: string]: any },
      tz: string,
    ) => {
      memo.push({
        name: tz,
        offset: moment.tz(tz).utcOffset(),
      })

      return memo
    }, [],
  )
  .sort((a, b) => a.offset - b.offset)
  .reduce((memo, tz) => {
    const timezone = tz.offset ? moment.tz(tz.name).format('Z') : ''
    options.push({ value: tz.name, label: `(GMT${timezone}) ${tz.name}` })
  }, '')

const TimeZoneSelect = ({ value, onChange, ...props }) => {
  const [selectedTimeZone, setSelectedTimeZone] = useState(value || Intl.DateTimeFormat().resolvedOptions().timeZone)

  const handleChange = (tz) => {
    setSelectedTimeZone(tz)
    onChange && onChange(tz)
  }

  return (
    <Select
      defaultValue={selectedTimeZone}
      onChange={handleChange}
      {...props}
    >
      {options.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
    </Select>
  )
}

export default TimeZoneSelect
