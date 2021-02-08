import React from 'react'
import { withRouter } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PieChartOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import routeUtils from 'utils/route'
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
      <Menu.Item key="/datasheets">
        <DatabaseOutlined />
        {I18n.t('common.model.datasheet')}
      </Menu.Item>
    </Menu>
  )
}

export default withRouter(MyMenu)
