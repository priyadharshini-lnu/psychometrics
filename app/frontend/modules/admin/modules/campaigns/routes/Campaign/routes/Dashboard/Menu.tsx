import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Menu as AntMenu } from 'antd'
import routeUtils from 'utils/route'
import settings from 'modules/admin/modules/campaigns/settings'
import Campaign from 'modules/admin/modules/campaigns/interfaces/Campaign'
import routes from './routes'

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
  const { campaignId } = useParams<{ campaignId: string }>()
  const history = useHistory()
  const onSelect = ({ key }) => {
    routeUtils.moveTo(history, `${settings.urlPrefix}/${campaignId}/dashboard`, key)
  }

  return (
    <AntMenu
      onSelect={onSelect}
      selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
      mode="horizontal"
    >
      {!dashboardInitialized && campaignPermissions.viewDashboard && (
      <AntMenu.Item key="/initialize">
        {I18n.t('administration.dashboard.tabs.dashboard')}
      </AntMenu.Item>
      )}
      {dashboardPreviewAvailable && campaignPermissions.viewDashboard && (
      <AntMenu.Item key="/preview">
        {I18n.t('administration.dashboard.tabs.dashboard')}
      </AntMenu.Item>
      )}
      {dashboardInitialized && canManageDashboard && (
      <AntMenu.Item key="/settings">
        {I18n.t('administration.dashboard.tabs.settings')}
      </AntMenu.Item>
      )}
      {campaignPermissions.viewAccesssheet && (
      <AntMenu.Item key="/accesssheets">
        {I18n.t('administration.dashboard.tabs.accesssheet')}
      </AntMenu.Item>
      )}
      {campaignPermissions.viewAccesssheetSettings && (
      <AntMenu.Item key="/accesssheet_settings">
        {I18n.t('administration.dashboard.tabs.accesssheet_setting')}
      </AntMenu.Item>
      )}
    </AntMenu>
  )
}
