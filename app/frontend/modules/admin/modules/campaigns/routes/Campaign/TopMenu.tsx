import React, { useMemo } from 'react'
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

import routeUtils from 'utils/route'
import User from 'modules/admin/modules/campaigns/interfaces/User'

const { I18n } = window

interface Props {
  prefix?: string
  currentUser: User
}

const ROUTES = [
  '/participants',
  '/assessments_reports',
  '/registration_codes',
  '/datasheet',
  '/admins',
  '/options',
]

const TopMenu: React.FC<Props> = ({ prefix, currentUser }) => {
  const { pathname } = useLocation()

  const history = useHistory()

  const onClick = ({ key }) => {
    const basePath = routeUtils.getBasePath(prefix)
    history.push(`${basePath}${key}`)
  }

  const selectedActiveKeys = useMemo(() => {
    const selectedMenu = ROUTES.find(route => pathname.includes(route))
    const selectedMenuInArray = selectedMenu ? [selectedMenu] : []

    return selectedMenuInArray
  }, [pathname])

  return (
    <Menu
      onSelect={onClick}
      selectedKeys={selectedActiveKeys}
      mode="horizontal"
      data-testid="top-level-navigation"
    >
      <Menu.Item key="/participants">
        <UserOutlined />
        Participants
      </Menu.Item>
      {currentUser.permissions.manageCampaigns && (
        <Menu.Item key="/assessments_reports">
          <PieChartOutlined />
          Assessments & Reports
        </Menu.Item>
      )}
      {currentUser.permissions.viewRegistrationCodes && (
        <Menu.Item key="/registration_codes">
          <QrcodeOutlined />
          Registration codes
        </Menu.Item>
      )}
      {currentUser.permissions.viewDatasheets && (
        <Menu.Item key="/datasheet">
          <DatabaseOutlined />
          {I18n.t('common.model.datasheet')}
        </Menu.Item>
      )}
      {currentUser.permissions.manageCampaignAdmins && (
        <Menu.Item key="/admins">
          <SolutionOutlined />
          {I18n.t('common.model.admins')}
        </Menu.Item>
      )}
      {currentUser.permissions.manageOptions && (
        <Menu.Item key="/options">
          <SettingOutlined />
          Options
        </Menu.Item>
      )}
    </Menu>
  )
}

export default TopMenu
