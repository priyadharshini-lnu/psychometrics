import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Menu as AntMenu } from 'antd'
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
  const menuItems: { key: string, label: string }[] = []
  !dashboardInitialized && campaignPermissions.viewDashboard && menuItems.push({
    key: '/initialize',
    label: I18n.t('admin.dashboard'),
  })
  dashboardPreviewAvailable && campaignPermissions.viewDashboard && menuItems.push({
    key: '/preview',
    label: I18n.t('admin.dashboard'),
  })
  dashboardInitialized && canManageDashboard && menuItems.push({
    key: '/settings',
    label: I18n.t('admin.dashboard_tabs_settings'),
  })
  campaignPermissions.viewAccesssheet && menuItems.push({
    key: '/accesssheets',
    label: I18n.t('admin.dashboard_tabs_accesssheet'),
  })
  campaignPermissions.viewAccesssheetSettings && menuItems.push({
    key: '/accesssheet_settings',
    label: I18n.t('admin.dashboard_tabs_accesssheet_setting'),
  })

  const activeTab = menuItems.find(({ key }) => pathname.includes(key))

  return (
    <AntMenu
      items={menuItems}
      onSelect={onSelect}
      selectedKeys={activeTab ? [activeTab.key] : []}
      mode="horizontal"
    />
  )
}
