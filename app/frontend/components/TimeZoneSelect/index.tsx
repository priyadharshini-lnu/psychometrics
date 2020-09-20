import React, { useState } from 'react'
import moment from 'moment-timezone'
import { Form, Select } from 'antd'

const zones = [
  'Pacific/Midway',
  'Pacific/Pago_Pago',
  'Pacific/Honolulu',
  'America/Juneau',
  'America/Los_Angeles',
  'America/Tijuana',
  'America/Denver',
  'America/Phoenix',
  'America/Chihuahua',
  'America/Mazatlan',
  'America/Chicago',
  'America/Regina',
  'America/Mexico_City',
  'America/Monterrey',
  'America/Guatemala',
  'America/New_York',
  'America/Indiana/Indianapolis',
  'America/Bogota',
  'America/Lima',
  'America/Halifax',
  'America/Caracas',
  'America/La_Paz',
  'America/Santiago',
  'America/St_Johns',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'America/Montevideo',
  'America/Guyana',
  'America/Godthab',
  'Atlantic/South_Georgia',
  'Atlantic/Azores',
  'Atlantic/Cape_Verde',
  'Europe/Dublin',
  'Europe/London',
  'Europe/Lisbon',
  'Africa/Casablanca',
  'Africa/Monrovia',
  'Etc/UTC',
  'Europe/Belgrade',
  'Europe/Bratislava',
  'Europe/Budapest',
  'Europe/Ljubljana',
  'Europe/Prague',
  'Europe/Sarajevo',
  'Europe/Skopje',
  'Europe/Warsaw',
  'Europe/Zagreb',
  'Europe/Brussels',
  'Europe/Copenhagen',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Zurich',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Vienna',
  'Africa/Algiers',
  'Europe/Bucharest',
  'Africa/Cairo',
  'Europe/Helsinki',
  'Europe/Kiev',
  'Europe/Riga',
  'Europe/Sofia',
  'Europe/Tallinn',
  'Europe/Vilnius',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Minsk',
  'Asia/Jerusalem',
  'Africa/Harare',
  'Africa/Johannesburg',
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Volgograd',
  'Europe/Samara',
  'Asia/Kuwait',
  'Asia/Riyadh',
  'Africa/Nairobi',
  'Asia/Baghdad',
  'Asia/Tehran',
  'Asia/Muscat',
  'Asia/Baku',
  'Asia/Tbilisi',
  'Asia/Yerevan',
  'Asia/Kabul',
  'Asia/Yekaterinburg',
  'Asia/Karachi',
  'Asia/Tashkent',
  'Asia/Kolkata',
  'Asia/Kathmandu',
  'Asia/Dhaka',
  'Asia/Colombo',
  'Asia/Almaty',
  'Asia/Novosibirsk',
  'Asia/Rangoon',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Krasnoyarsk',
  'Asia/Shanghai',
  'Asia/Chongqing',
  'Asia/Hong_Kong',
  'Asia/Urumqi',
  'Asia/Kuala_Lumpur',
  'Asia/Singapore',
  'Asia/Taipei',
  'Australia/Perth',
  'Asia/Irkutsk',
  'Asia/Ulaanbaatar',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Yakutsk',
  'Australia/Darwin',
  'Australia/Adelaide',
  'Australia/Melbourne',
  'Australia/Sydney',
  'Australia/Brisbane',
  'Australia/Hobart',
  'Asia/Vladivostok',
  'Pacific/Guam',
  'Pacific/Port_Moresby',
  'Asia/Magadan',
  'Asia/Srednekolymsk',
  'Pacific/Guadalcanal',
  'Pacific/Noumea',
  'Pacific/Fiji',
  'Asia/Kamchatka',
  'Pacific/Majuro',
  'Pacific/Auckland',
  'Pacific/Tongatapu',
  'Pacific/Fakaofo',
  'Pacific/Chatham',
  'Pacific/Apia',
]

const options: Array<{ value: string, label: string }> = []

zones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .reduce((obj: { [propName: string]: any }, entry: string) => {
    obj.push({
      name: entry,
      offset: moment.tz(entry).utcOffset(),
    })

    return obj
  }, [])
  .sort((a, b) => a.offset - b.offset)
  .map((tz) => {
    const offset = tz.offset ? moment.tz(tz.name).format('Z') : ''
    options.push({ value: tz.name, label: `(GMT${offset}) ${tz.name}` })
  })

const { Option } = Select
const TimeZoneSelect = ({
  value,
  label,
  onChange,
  ...props
}) => {
  const [selectedTimeZone, setSelectedTimeZone] = useState(value || Intl.DateTimeFormat().resolvedOptions().timeZone)

  const handleChange = (tz) => {
    setSelectedTimeZone(tz)
    onChange && onChange(tz)
  }

  return (
    <Form.Item name="time_zone" label={label}>
      <Select
        showSearch
        defaultValue={selectedTimeZone}
        onChange={handleChange}
        style={{ width: 240 }}
        optionFilterProp="children"
        filterOption={(input, option) => option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        {...props}
      >
        {options.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
      </Select>
    </Form.Item>
  )
}

export default TimeZoneSelect
