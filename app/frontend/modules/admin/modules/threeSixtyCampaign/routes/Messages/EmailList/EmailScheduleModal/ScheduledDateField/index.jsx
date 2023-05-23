import {
  Button, Input, Menu, Dropdown, DatePicker,
} from 'antd'
import moment from 'moment'
import { CaretDownOutlined } from '@ant-design/icons'
import styles from './styles.less'

export default function ScheduledDateField ({ scheduledDate, updateScheduleDate }) {
  const handleScheduleDateChange = ({ key }) => {
    updateScheduleDate(moment().add(...key.split(',')).format())
  }
  const menuItems = [
    { key: [0, 'hours'], label: 'Send Now' },
    { key: [1, 'hours'], label: 'Send in 1 hour' },
    { key: [8, 'hours'], label: 'Send in 8 hour' },
    { key: [1, 'days'], label: 'Send in 1 day' },
    { key: [3, 'days'], label: 'Send in 3 days' },
    { key: [7, 'days'], label: 'Send in 7 days' },
    { key: [14, 'days'], label: 'Send in 14 days' },
    { key: [28, 'days'], label: 'Send in 28 days' },
  ]

  const menu = (
    <Menu items={menuItems} onClick={handleScheduleDateChange} />
  )

  const date = scheduledDate ? moment(scheduledDate) : undefined
  return (
    <Input.Group compact>
      <DatePicker
        showTime={{ format: 'hh:mm a' }}
        format="MMMM Do YYYY, hh:mm a"
        value={date}
        onChange={date => updateScheduleDate(date && date.format())}
        className={styles.datePicker}
        placeholder="Scheduled date"
      />
      <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
        <Button className={styles.scheduleDateDropdownButton}>
          <CaretDownOutlined />
        </Button>
      </Dropdown>
    </Input.Group>
  )
}
