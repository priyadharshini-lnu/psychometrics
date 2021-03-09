import React from 'react'
import { TimePicker } from 'antd'
import moment from 'moment'

export default function TimeEntry () {
  return (
    <TimePicker
      size="default"
      format="HH:mm"
      disabledTime={false}
      showTime={{ defaultValue: moment('00:00', 'HH:mm') }}
    />
  )
}
