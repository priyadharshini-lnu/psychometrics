import React from 'react'
import {
  Button, Icon, Input, Menu, Dropdown, DatePicker,
} from 'antd'
import style from './style.scss'

export default function ScheduledDateField ({ scheduledDate, updateScheduleDate }) {
  const handleScheduleDateChange = ({ key }) => {
    updateScheduleDate(moment().add(...key.split(',')).format())
  }

  const menu = (
    <Menu onClick={handleScheduleDateChange}>
      <Menu.Item key={[0, 'hours']}>
        Send Now
      </Menu.Item>
      <Menu.Item key={[1, 'hours']}>
        Send in 1 hour
      </Menu.Item>
      <Menu.Item key={[8, 'hours']}>
        Send in 8 hour
      </Menu.Item>
      <Menu.Item key={[1, 'days']}>
        Send in 1 day
      </Menu.Item>
      <Menu.Item key={[3, 'days']}>
        Send in 3 days
      </Menu.Item>
      <Menu.Item key={[7, 'days']}>
        Send in 7 days
      </Menu.Item>
      <Menu.Item key={[14, 'days']}>
        Send in 14 days
      </Menu.Item>
      <Menu.Item key={[28, 'days']}>
        Send in 28 days
      </Menu.Item>
    </Menu>
  )

  const date = scheduledDate ? moment(scheduledDate) : undefined
  return (
    <Input.Group compact>
      <DatePicker
        showTime
        value={date}
        onChange={(date) => { updateScheduleDate(date.format()) }}
        className={style.datePicker}
        placeholder="Scheduled date"
      />
      <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
        <Button style={{ width: '45px' }}>
          <Icon type="caret-down" />
        </Button>
      </Dropdown>
    </Input.Group>
  )
}
