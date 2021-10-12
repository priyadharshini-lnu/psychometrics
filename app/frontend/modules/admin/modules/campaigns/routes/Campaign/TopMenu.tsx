import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  SettingOutlined,
  PieChartOutlined,
  QrcodeOutlined,
  DatabaseOutlined,
  SolutionOutlined,
} from '@ant-design/icons'

import User from 'modules/admin/modules/campaigns/interfaces/User'
import routeUtils from 'utils/route'

const { I18n } = window

interface Props {
  prefix?: string
  currentUser: User
}

const TopMenu: React.FC<Props> = ({ prefix, currentUser }) => {
  const { pathname } = useLocation()

  const history = useHistory()

  const handleOnSelect = ({ key }) => {
    const basePath = routeUtils.getBasePath(prefix)
    history.push(`${basePath}/${key}`)
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/participants')) {
      return ['participants']
    }
    if (pathname.includes('/assessments_reports')) {
      return ['assessments_reports']
    }
    if (pathname.includes('/registration_codes')) {
      return ['registration_codes']
    }
    if (pathname.includes('/datasheet')) {
      return ['datasheet']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/options')) {
      return ['options']
    }
    return undefined
  }

  return (
    <Menu
      onSelect={handleOnSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      mode="horizontal"
      data-testid="top-level-navigation"
    >
      <Menu.Item key="participants">
        <UserOutlined />
        Participants
      </Menu.Item>
      <Menu.Item key="admins">
        <SolutionOutlined />
        {I18n.t('common.model.admins')}
      </Menu.Item>
      <Menu.Item key="assessments_reports">
        <PieChartOutlined />
        Assessments & Reports
      </Menu.Item>
      <Menu.Item key="registration_codes">
        <QrcodeOutlined />
        Registration codes
      </Menu.Item>
      <Menu.Item key="datasheet">
        <DatabaseOutlined />
        {I18n.t('common.model.datasheet')}
      </Menu.Item>
      {currentUser.permissions.manageOptions && (
        <Menu.Item key="options">
          <SettingOutlined />
          Options
        </Menu.Item>
      )}
    </Menu>
  )
}

export default TopMenu
