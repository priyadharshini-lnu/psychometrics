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
import { get as getCurrentUser } from 'core/currentUser'
import { connect } from 'react-redux'
import settings from '../settings'


const MyMenu = ({ history, routes, currentUser }) => {
  const onClick = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)

  return (
    <Menu className="mbm" onSelect={onClick} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
      <Menu.Item key="/participants">
        <UserOutlined />
        Participants
      </Menu.Item>
      {currentUser.permissions.manageMessages && (
        <Menu.Item key="/messages/options">
          <MailOutlined />
          Messages
        </Menu.Item>
      )}
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

export default withRouter(connect(state => ({
  currentUser: getCurrentUser(state),
}), {})(MyMenu))
