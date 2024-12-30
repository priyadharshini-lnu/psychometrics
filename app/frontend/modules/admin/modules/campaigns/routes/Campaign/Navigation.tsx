import { FC } from 'react'
import type { MenuProps } from 'antd'
import { Link as RouterLink, useLocation } from 'react-router-dom'
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
  RadarChartOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import routeUtils from '~/utils/route'
import { Subnavigation } from '~/components/Subnavigation'

type MenuItem = Required<MenuProps>['items'][number];

const { I18n } = window

const Link = ({ route, children }) => (
  <RouterLink to={route}>{children}</RouterLink>
)

const menuItems = (permissions: Campaign['permissions'], basePath: string): MenuItem[] => [
  {
    key: 'participants',
    label: <Link route={`${basePath}/participants`}>{I18n.t('administration.navigation.participants')}</Link>,
    icon: <UserOutlined />,
  },
  permissions.viewWorkshops ? {
    key: 'scheduling',
    label:
    <Link route={`${basePath}/scheduling`}>{I18n.t('administration.navigation.scheduling')}</Link>,
    icon: <CalendarOutlined />,
  } : null,
  permissions.manageCampaigns ? {
    key: 'assessments_reports',
    label:
    <Link route={`${basePath}/assessments_reports`}>{I18n.t('administration.navigation.assessments_reports')}</Link>,
    icon: <PieChartOutlined />,
  } : null,
  permissions.viewRegistrationCodes ? {
    key: 'registration_codes',
    label:
    <Link route={`${basePath}/registration_codes`}>{I18n.t('administration.navigation.registration_codes')}</Link>,
    icon: <QrcodeOutlined />,
  } : null,
  permissions.stats ? {
    key: 'stats',
    label: <Link route={`${basePath}/stats`}>{I18n.t('administration.stats.title')}</Link>,
    icon: <LineChartOutlined />,
  } : null,
  (permissions.viewDashboard || permissions.viewAccesssheet || permissions.viewAccesssheetSettings) ? {
    key: 'dashboard',
    label:
    <Link route={`${basePath}/dashboard`}>{I18n.t('administration.dashboard.tabs.dashboard')}</Link>,
    icon: <DashboardOutlined />,
  } : null,
  permissions.viewDatasheets ? {
    key: 'datasheet',
    label:
    <Link route={`${basePath}/datasheet`}>{I18n.t('common.model.datasheet')}</Link>,
    icon: <DatabaseOutlined />,
  } : null,
  permissions.viewCampaignScoring ? {
    key: 'scoring',
    label: <Link route={`${basePath}/scoring`}>{I18n.t('common.model.scoring')}</Link>,
    icon: <RadarChartOutlined />,
  } : null,
  permissions.manageCampaignAdmins ? {
    key: 'admins',
    label:
    <Link route={`${basePath}/admins`}>{I18n.t('common.model.admins')}</Link>,
    icon: <SolutionOutlined />,
  } : null,
  permissions.manageOptions ? {
    key: 'options',
    label:
    <Link route={`${basePath}/options`}>
      {I18n.t('administration.navigation.options')}
    </Link>,
    icon: <SettingOutlined />,
  } : null,
  permissions.viewDataExports ? {
    key: 'data_exports',
    label:
    <Link route={`${basePath}/data_exports`}>
      {I18n.t('administration.breadcrumbs.data_exports')}
    </Link>,
    icon: <ExportOutlined />,
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
  if (pathname.includes('/scoring')) {
    return 'scoring'
  }
  if (pathname.includes('/data_exports')) {
    return 'data_exports'
  }
  return ''
}

interface Props {
  prefix?: string
  permissions: Campaign['permissions']
}

export const Navigation: FC<Props> = ({
  prefix, permissions,
}) => {
  const { pathname } = useLocation()
  return (
    <Subnavigation
      selectedKeys={[getSelected(pathname)]}
      items={menuItems(permissions, routeUtils.getBasePath(prefix))}
    />
  )
}
