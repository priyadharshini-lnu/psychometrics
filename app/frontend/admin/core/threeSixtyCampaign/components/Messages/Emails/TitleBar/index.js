import React from 'react'
import {
  Menu, Button, Icon, Dropdown,
} from 'antd'
import css from './style.scss'

export default function ({ selectedTemplate }) {
  const menu = (
    <Menu onClick={() => {}}>
      <Menu.Item key="schedule_email">
        Schedule Email
      </Menu.Item>
      <Menu.Item key="schedule_test_email">
        Send Test Email
      </Menu.Item>
    </Menu>
  )

  return (
    <div className={css.container}>
      <div className={css.titleContainer}>
        <div className={css.title}>{selectedTemplate.name}</div>
        <div>Description</div>
      </div>
      {selectedTemplate.schedulable && (
      <div className={css.buttonContainer}>
        <Button type="primary" size="large" className={css.button}>
          <Icon type="schedule" />
          Schedule Email
        </Button>
        <Dropdown
          className="dropdown"
          overlay={menu}
          placement="bottomLeft"
          trigger={['click']}
        >
          <Icon type="caret-down" />
        </Dropdown>
      </div>
      )}
    </div>
  )
}
