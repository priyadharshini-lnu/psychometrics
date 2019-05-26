import React from 'react'
import { withRouter } from 'react-router-dom'
import { Menu, Icon } from 'antd'
import routeUtils from 'utils/routeUtils'
import settings from '../settings'

const MyMenu = ({ history, routes }) => {
  const onClick = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)

  return (
    <Menu className="mbm" onSelect={onClick} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
      <Menu.Item key="/participants">
        <Icon type="user" />
        Participants
      </Menu.Item>
      <Menu.Item key="/messages">
        <Icon type="mail" />
        Messages
      </Menu.Item>
      <Menu.Item key="/reports/options">
        <Icon type="pie-chart" />
        Reports
      </Menu.Item>
    </Menu>
  )
}

export default withRouter(MyMenu)
