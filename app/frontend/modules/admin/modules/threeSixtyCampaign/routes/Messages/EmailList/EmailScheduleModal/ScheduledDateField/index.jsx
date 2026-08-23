import { useState } from 'react'
import {
  Button, Space, Dropdown, DatePicker,
} from 'antd'
import { CaretDownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import styles from './styles.less'

export default function ScheduledDateField ({ scheduledDate, updateScheduleDate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleScheduleDateChange = ({ key }) => {
    updateScheduleDate(dayjs().add(...key.split(',')).format())
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

  const date = scheduledDate ? dayjs(scheduledDate) : undefined
  return (
    <Space.Compact>
      <DatePicker
        showTime={{ format: 'hh:mm a' }}
        format="MMMM Do YYYY, hh:mm a"
        value={date}
        onChange={date => updateScheduleDate(date && date.format())}
        className={styles.datePicker}
        placeholder="Scheduled date"
      />
      <Dropdown
        menu={{ items: menuItems, onClick: handleScheduleDateChange }}
        placement="bottomLeft"
        trigger={['click']}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      >
        <Button
          className={styles.scheduleDateDropdownButton}
          aria-label={I18n.t('admin.threesixty_campaigns_schedule_date_presets')}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <CaretDownOutlined />
        </Button>
      </Dropdown>
    </Space.Compact>
  )
}
