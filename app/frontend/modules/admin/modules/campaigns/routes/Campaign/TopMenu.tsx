import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Menu } from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import {
  UserOutlined,
  SettingOutlined,
  PieChartOutlined,
  QrcodeOutlined,
  DatabaseOutlined,
  SolutionOutlined,
  DashboardOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import Campaign from 'modules/admin/modules/campaigns/interfaces/Campaign'
import routeUtils from 'utils/route'

const { I18n } = window

interface Props {
  prefix?: string
  campaignPermissions: Campaign['permissions']
}

const TopMenu: React.FC<Props> = ({ prefix, campaignPermissions }) => {
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
    if (pathname.includes('/dashboard')) {
      return ['dashboard']
    }
    if (pathname.includes('/registration_codes')) {
      return ['registration_codes']
    }
    if (pathname.includes('/stats')) {
      return ['stats']
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

  const menuItems: ItemType[] = [{ key: 'participants', label: 'Participants', icon: <UserOutlined /> }]
  campaignPermissions.manageCampaigns && menuItems.push({
    key: 'assessments_reports',
    label: 'Assessments & Reports',
    icon: <PieChartOutlined />,
  })
  campaignPermissions.viewRegistrationCodes && menuItems.push({
    key: 'registration_codes',
    label: 'Registration codes',
    icon: <QrcodeOutlined />,
  })
  campaignPermissions.stats && menuItems.push({
    key: 'stats',
    label: I18n.t('administration.stats.title'),
    icon: <LineChartOutlined />,
  })
  if (campaignPermissions.viewDashboard || campaignPermissions.viewAccesssheet
    || campaignPermissions.viewAccesssheetSettings) {
    menuItems.push({
      key: 'dashboard',
      label: I18n.t('administration.dashboard.tabs.dashboard'),
      icon: <DashboardOutlined />,
    })
  }
  campaignPermissions.viewDatasheets && menuItems.push({
    key: 'datasheet',
    label: I18n.t('common.model.datasheet'),
    icon: <DatabaseOutlined />,
  })
  campaignPermissions.viewDatasheets && menuItems.push({
    key: 'admins',
    label: I18n.t('common.model.admins'),
    icon: <SolutionOutlined />,
  })
  campaignPermissions.manageOptions && menuItems.push({
    key: 'options',
    label: 'Options',
    icon: <SettingOutlined />,
  })
  return (
    <Menu
      onSelect={handleOnSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      mode="horizontal"
      items={menuItems}
    />
  )
}

export default TopMenu
