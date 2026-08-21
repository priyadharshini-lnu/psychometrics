import { FC } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Person, CalendarToday, PieChart, QrCode, TrendingUp as Stats, Storage, Speed, AdminPanelSettings,
  Settings, SmartToy, OpenInNew as Export, BarChart,
} from '@thetalententerprise/glint/icons'

import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import routeUtils from '~/utils/route'
import { useRegisterSubnav } from '~/components/AdminShell/SubnavContext'
import { MenuItem } from '~/interfaces/Antd'


const { I18n } = window

const Link = ({ route, children }) => (
  <RouterLink to={route}>{children}</RouterLink>
)

// Links point at each section's landing leaf, not its root: a root url index-redirects, costing a second transition.
const menuItems = (permissions: Campaign['permissions'], basePath: string): MenuItem[] => [
  permissions.viewCampaign ? {
    key: 'participants',
    label: <Link route={`${basePath}/participants/subjects`}>{I18n.t('admin.participants')}</Link>,
    icon: <Person />,
  } : null,
  permissions.viewWorkshops ? {
    key: 'scheduling',
    label:
    <Link route={`${basePath}/scheduling/assessment_center`}>{I18n.t('admin.scheduling')}</Link>,
    icon: <CalendarToday />,
  } : null,
  permissions.viewAssessmentsAndReports ? {
    key: 'assessments_reports',
    label:
    <Link route={`${basePath}/assessments_reports/manage`}>{I18n.t('admin.assessments_reports')}</Link>,
    icon: <PieChart />,
  } : null,
  permissions.viewRegistrationCodes ? {
    key: 'registration_codes',
    label:
    <Link route={`${basePath}/registration_codes`}>{I18n.t('admin.registration_codes')}</Link>,
    icon: <QrCode />,
  } : null,
  permissions.stats ? {
    key: 'stats',
    label: <Link route={`${basePath}/stats`}>{I18n.t('admin.stats')}</Link>,
    icon: <Stats />,
  } : null,
  // Dashboard keeps the section root: which tab it lands on depends on this admin's permissions.
  (permissions.viewDashboard || permissions.viewAccesssheet || permissions.viewAccesssheetSettings) ? {
    key: 'dashboard',
    label:
    <Link route={`${basePath}/dashboard`}>{I18n.t('admin.dashboard')}</Link>,
    icon: <Speed />,
  } : null,
  permissions.viewDatasheets ? {
    key: 'datasheet',
    label:
    <Link route={`${basePath}/datasheet`}>{I18n.t('admin.datasheet')}</Link>,
    icon: <Storage />,
  } : null,
  permissions.viewCampaignScoring ? {
    key: 'scoring',
    label: <Link route={`${basePath}/scoring/subject_scores`}>{I18n.t('admin.scoring')}</Link>,
    icon: <BarChart />,
  } : null,
  permissions.viewAiArtifacts ? {
    key: 'ai_artifacts',
    label: <Link route={`${basePath}/ai_artifacts/results`}>{I18n.t('admin.ai_artifacts')}</Link>,
    icon: <SmartToy />,
  } : null,
  permissions.manageCampaignAdmins ? {
    key: 'admins',
    label:
    <Link route={`${basePath}/admins`}>{I18n.t('admin.admins')}</Link>,
    icon: <AdminPanelSettings />,
  } : null,
  permissions.manageOptions ? {
    key: 'options',
    label:
    <Link route={`${basePath}/options`}>
      {I18n.t('admin.options')}
    </Link>,
    icon: <Settings />,
  } : null,
  permissions.viewAuditReports ? {
    key: 'audit_reports',
    label:
    <Link route={`${basePath}/audit_reports`}>
      {I18n.t('admin.audit_reports')}
    </Link>,
    icon: <Export />,
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
  if (pathname.includes('/ai_artifacts')) {
    return 'ai_artifacts'
  }
  if (pathname.includes('/audit_reports')) {
    return 'audit_reports'
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
  // Publishes into the shell's rail rather than rendering its own; renders nothing itself.
  useRegisterSubnav(menuItems(permissions, routeUtils.getBasePath(prefix)), [getSelected(pathname)])
  return null
}
