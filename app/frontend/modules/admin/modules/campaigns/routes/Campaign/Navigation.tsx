import { FC } from 'react'
import type { MenuProps } from 'antd'
import { useLocation, useHistory } from 'react-router-dom'
import {
  UserOutlined,
  SettingOutlined,
  PieChartOutlined,
  QrcodeOutlined,
  DatabaseOutlined,
  SolutionOutlined,
  DashboardOutlined,
  LineChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import routeUtils from '~/utils/route'
import { Subnavigation } from '~/components/Subnavigation'

type MenuItem = Required<MenuProps>['items'][number];

const { I18n } = window

const menuItems = (permissions: Campaign['permissions']): MenuItem[] => [
  {
    key: 'participants',
    label: 'Participants',
    icon: <UserOutlined />,
  },
  permissions.viewWorkshops ? {
    key: 'scheduling',
    label: 'Scheduling',
    icon: <CalendarOutlined />,
  } : null,
  permissions.manageCampaigns ? {
    key: 'assessments_reports',
    label: 'Assessments & Reports',
    icon: <PieChartOutlined />,
  } : null,
  permissions.viewRegistrationCodes ? {
    key: 'registration_codes',
    label: 'Registration codes',
    icon: <QrcodeOutlined />,
  } : null,
  permissions.stats ? {
    key: 'stats',
    label: I18n.t('administration.stats.title'),
    icon: <LineChartOutlined />,
  } : null,
  (permissions.viewDashboard || permissions.viewAccesssheet || permissions.viewAccesssheetSettings) ? {
    key: 'dashboard',
    label: I18n.t('administration.dashboard.tabs.dashboard'),
    icon: <DashboardOutlined />,
  } : null,
  permissions.viewDatasheets ? {
    key: 'datasheet',
    label: I18n.t('common.model.datasheet'),
    icon: <DatabaseOutlined />,
  } : null,
  permissions.manageCampaignAdmins ? {
    key: 'admins',
    label: I18n.t('common.model.admins'),
    icon: <SolutionOutlined />,
  } : null,
  permissions.manageOptions ? {
    key: 'options',
    label: 'Options',
    icon: <SettingOutlined />,
  } : null,
].filter(Boolean)

const getSelected = (pathname): string => {
  if (pathname.includes('/participants')) {
    return 'participants'
  }
  if (pathname.includes('/scheduling')) {
    return 'scheduling'
  }
  if (pathname.includes('/assessments_reports')) {
    return 'assessments_reports'
  }
  if (pathname.includes('/dashboard')) {
    return 'dashboard'
  }
  if (pathname.includes('/registration_codes')) {
    return 'registration_codes'
  }
  if (pathname.includes('/stats')) {
    return 'stats'
  }
  if (pathname.includes('/datasheet')) {
    return 'datasheet'
  }
  if (pathname.includes('/admins')) {
    return 'admins'
  }
  if (pathname.includes('/options')) {
    return 'options'
  }
  return ''
}

interface Props {
  prefix?: string
  permissions: Campaign['permissions']
}

export const Navigation:FC<Props> = ({
  prefix, permissions,
}) => {
  const { pathname } = useLocation()
  const history = useHistory()

  const onSelect = (key) => {
    const basePath = routeUtils.getBasePath(prefix)
    history.push(`${basePath}/${key}`)
  }

  return (
    <Subnavigation
      onSelect={onSelect}
      selectedKeys={[getSelected(pathname)]}
      items={menuItems(permissions)}
    />
  )
}
