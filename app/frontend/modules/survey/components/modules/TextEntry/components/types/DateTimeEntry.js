import React from 'react'
import { DatePicker } from 'antd'
import moment from 'moment'

export default function DateTimeEntry () {
  return (
    <DatePicker
      size="default"
      format="YYYY-MM-DD HH:mm:ss"
      disabledTime={false}
      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
    />
  )
}
