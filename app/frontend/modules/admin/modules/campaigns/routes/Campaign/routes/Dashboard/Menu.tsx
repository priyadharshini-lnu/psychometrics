import React, { ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Menu as AntMenu } from 'antd'
import {
  DoorOpen, PlayCircle, Settings, Speed, Tune,
} from '@thetalententerprise/glint/icons'
import settings from '~/modules/admin/modules/campaigns/settings'
import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import routeUtils from '~/utils/route'

const { I18n } = window

interface OwnProps {
  dashboardInitialized: boolean
  dashboardPreviewAvailable: boolean
  canManageDashboard: boolean
  campaignPermissions: Campaign['permissions']
}
type Props = OwnProps

export const Menu: React.FC<Props> = ({
  dashboardInitialized, dashboardPreviewAvailable, canManageDashboard, campaignPermissions,
}) => {
  const { campaignId } = useParams() as { campaignId: string }
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const onSelect = ({ key }) => {
    routeUtils.moveTo(navigate, `${settings.urlPrefix}/${campaignId}/dashboard`, key)
  }
  const menuItems: { key: string, icon: ReactNode, label: string }[] = []
  !dashboardInitialized && campaignPermissions.viewDashboard && menuItems.push({
    key: '/initialize',
    icon: <PlayCircle />,
    label: I18n.t('admin.dashboard'),
  })
  dashboardPreviewAvailable && campaignPermissions.viewDashboard && menuItems.push({
    key: '/preview',
    icon: <Speed />,
    label: I18n.t('admin.dashboard'),
  })
  dashboardInitialized && canManageDashboard && menuItems.push({
    key: '/settings',
    icon: <Settings />,
    label: I18n.t('admin.dashboard_tabs_settings'),
  })
  campaignPermissions.viewAccesssheet && menuItems.push({
    key: '/accesssheets',
    icon: <DoorOpen />,
    label: I18n.t('admin.dashboard_tabs_accesssheet'),
  })
  campaignPermissions.viewAccesssheetSettings && menuItems.push({
    key: '/accesssheet_settings',
    icon: <Tune />,
    label: I18n.t('admin.dashboard_tabs_accesssheet_setting'),
  })

  const activeTab = menuItems.find(({ key }) => pathname.includes(key))

  if (menuItems.length < 2) return null

  return (
    <AntMenu
      items={menuItems}
      onSelect={onSelect}
      selectedKeys={activeTab ? [activeTab.key] : []}
      mode="horizontal"
    />
  )
}
