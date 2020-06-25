import React, { Attributes } from 'react'
import _ from 'lodash'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined, SettingOutlined, PieChartOutlined, QrcodeOutlined,
} from '@ant-design/icons'
import routeUtils from 'utils/route'

interface Props extends Attributes {
  prefix?: string
}
const ROUTES = ['/users', '/assessments_reports', '/registration_codes', '/options']

const MyMenu: React.FC<Props & RouteComponentProps> = ({ history, prefix }) => {
  const onClick = ({ key }) => routeUtils.moveTo(history, prefix, key)

  const active = _.find(ROUTES, (key => location.pathname.includes(key)))

  return (
    <Menu className="mbm" onSelect={onClick} selectedKeys={active} mode="horizontal">
      <Menu.Item key="/users">
        <UserOutlined />
        Users
      </Menu.Item>
      <Menu.Item key="/assessments_reports">
        <PieChartOutlined />
        Assessments & Reports
      </Menu.Item>
      <Menu.Item key="/registration_codes">
        <QrcodeOutlined />
        Registration codes
      </Menu.Item>
      <Menu.Item key="/options">
        <SettingOutlined />
        Options
      </Menu.Item>
    </Menu>
  )
}

export default withRouter(MyMenu)
