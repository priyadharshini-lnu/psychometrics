import { useEffect } from 'react'
import { Select, DatePicker } from 'antd'
import dayjs from '~/utils/dayjs'
import { INVITATION_VALUES } from '~/modules/admin/constants/emailCriteria'
import styles from './styles.less'

export default function Invitation ({
  value, update, merge, subField,
}) {
  useEffect(() => {
    merge({ subField: INVITATION_VALUES.NOT_RECEIVED })
  }, [])

  const date = value ? dayjs(value) : undefined

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
          className={styles.datePicker}
          placeholder="Scheduled date"
        />
      )}
    </div>
  )
}
