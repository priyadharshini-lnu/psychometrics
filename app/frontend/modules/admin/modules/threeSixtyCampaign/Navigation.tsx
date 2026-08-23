import { FC, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation, useMatch } from 'react-router-dom'
import {
  AdminPanelSettings, Chat, Person, PieChart, SmartToy, Storage,
} from '@thetalententerprise/glint/icons'

import { useRegisterSubnav } from '~/components/AdminShell/SubnavContext'
import { RootState } from '~/modules/admin/core/rootReducers'
import { MenuItem } from '~/interfaces/Antd'
import { get as getCurrentCampaign } from './core/campaignDetails'
import settings from './settings'

const { I18n } = window

const link = (route: string, label: string): ReactNode => <Link to={route}>{label}</Link>

const canAccessMessages = permissions => Boolean(
  permissions?.accessEmailMessages || permissions?.accessMessagesOptions || permissions?.accessInstructionMessages,
)

// Links point at each section's landing leaf, not its root: a root url index-redirects, costing a second transition.
const menuItems = (permissions, basePath: string): MenuItem[] => [
  {
    key: 'participants',
    label: link(`${basePath}/participants/subjects`, I18n.t('admin.threesixty_campaigns_menu_participants_title')),
    icon: <Person />,
  },
  // Messages keeps the section root: which tab it lands on depends on this admin's permissions.
  canAccessMessages(permissions) ? {
    key: 'messages',
    label: link(`${basePath}/messages`, I18n.t('admin.threesixty_campaigns_menu_messages_title')),
    icon: <Chat />,
  } : null,
  {
    key: 'reports',
    label: link(`${basePath}/reports/options`, I18n.t('admin.threesixty_campaigns_menu_report_title')),
    icon: <PieChart />,
  },
  {
    key: 'datasheet',
    label: link(`${basePath}/datasheet`, I18n.t('admin.threesixty_campaigns_menu_datasheet_title')),
    icon: <Storage />,
  },
  {
    key: 'ai_artifacts',
    label: link(`${basePath}/ai_artifacts/results`, I18n.t('admin.ai_artifacts')),
    icon: <SmartToy />,
  },
  {
    key: 'admins',
    label: link(`${basePath}/admins`, I18n.t('admin.admins')),
    icon: <AdminPanelSettings />,
  },
].filter(Boolean)

const getSelected = (pathname: string): string => {
  if (pathname.includes('/participants')) {
    return 'participants'
  }
  if (pathname.includes('/messages')) {
    return 'messages'
  }
  if (pathname.includes('/reports')) {
    return 'reports'
  }
  if (pathname.includes('/datasheet')) {
    return 'datasheet'
  }
  if (pathname.includes('/ai_artifacts')) {
    return 'ai_artifacts'
  }
  if (pathname.includes('/admins')) {
    return 'admins'
  }
  return ''
}

export const Navigation: FC = () => {
  const { pathname } = useLocation()
  const permissions = useSelector((state: RootState) => getCurrentCampaign(state).permissions)
  const match = useMatch(`${settings.urlPrefix}/*`)

  useRegisterSubnav(menuItems(permissions, match?.pathnameBase ?? ''), [getSelected(pathname)])

  return null
}
