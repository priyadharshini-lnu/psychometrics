import React from 'react'
import { withRouter } from 'react-router-dom'
import { Menu } from 'antd'
import { UserOutlined, MailOutlined, PieChartOutlined } from '@ant-design/icons'
import routeUtils from 'utils/routeUtils'
import settings from '../settings'

const MyMenu = ({ history, routes }) => {
  const onClick = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)

  return (
    <Menu className="mbm" onSelect={onClick} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
      <Menu.Item key="/participants">
        <UserOutlined />
        Participants
      </Menu.Item>
      <Menu.Item key="/messages/options">
        <MailOutlined />
        Messages
      </Menu.Item>
      <Menu.Item key="/reports/options">
        <PieChartOutlined />
        Reports
      </Menu.Item>
    </Menu>
  )
}

export default withRouter(MyMenu)
