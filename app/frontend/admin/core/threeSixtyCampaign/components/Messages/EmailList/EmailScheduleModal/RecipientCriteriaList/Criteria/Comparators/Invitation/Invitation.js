import React, { useEffect } from 'react'
import { Select, DatePicker } from 'antd'
import { INVITATION_VALUES } from 'constants/emailCriteria'
import style from './style.scss'

export default function Invitation ({
  value, update, merge, subField,
}) {
  useEffect(() => {
    merge({ subField: INVITATION_VALUES.NOT_RECEIVED })
  }, [])

  const date = value ? moment(value) : undefined

  return (
    <div>
      <Select
        dropdownMatchSelectWidth={false}
        size="small"
        value={subField}
        onChange={value => update('subField', value)}
      >
        <Select.Option key={INVITATION_VALUES.NOT_RECEIVED}>Not received</Select.Option>
        <Select.Option key={INVITATION_VALUES.RECEIVED_AFTER}>Received After</Select.Option>
      </Select>
      {subField === INVITATION_VALUES.RECEIVED_AFTER && (
      <DatePicker
        showTime={{ format: 'hh:mm a' }}
        format="MMMM Do YYYY, hh:mm a"
        value={date}
        onChange={date => update('value', date && date.format())}
        className={style.datePicker}
        placeholder="Scheduled date"
      />
      )}
    </div>
  )
}
