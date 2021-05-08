import React, { useMemo } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  SettingOutlined,
  PieChartOutlined,
  QrcodeOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'

import routeUtils from 'utils/route'

const { I18n } = window

interface Props {
  prefix?: string
}

const ROUTES = [
  '/participants',
  '/assessments_reports',
  '/registration_codes',
  '/datasheet',
  '/options',
]

const TopMenu: React.FC<Props> = ({ prefix }) => {
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
      <Menu.Item key="/assessments_reports">
        <PieChartOutlined />
        Assessments & Reports
      </Menu.Item>
      <Menu.Item key="/registration_codes">
        <QrcodeOutlined />
        Registration codes
      </Menu.Item>
      <Menu.Item key="/datasheet">
        <DatabaseOutlined />
        {I18n.t('common.model.datasheet')}
      </Menu.Item>
      <Menu.Item key="/options">
        <SettingOutlined />
        Options
      </Menu.Item>
    </Menu>
  )
}

export default TopMenu
