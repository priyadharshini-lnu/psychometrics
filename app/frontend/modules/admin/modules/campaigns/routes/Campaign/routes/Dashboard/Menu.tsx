import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Menu as AntMenu } from 'antd'
import routeUtils from 'utils/route'
import settings from 'modules/admin/modules/campaigns/settings'
import routes from './routes'

const { I18n } = window

export const Menu: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const history = useHistory()
  const onSelect = ({ key }) => {
    routeUtils.moveTo(history, `${settings.urlPrefix}/${campaignId}/dashboard`, key)
  }

  return (
    <div className="position-relative">
      <AntMenu
        className="mbm"
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      >
        <AntMenu.Item key="/settings">
          {I18n.t('administration.dashboard.tabs.settings')}
        </AntMenu.Item>
        <AntMenu.Item key="/accesssheets">
          {I18n.t('administration.dashboard.tabs.accesssheet')}
        </AntMenu.Item>
        <AntMenu.Item key="/accesssheet_settings">
          {I18n.t('administration.dashboard.tabs.accesssheet_setting')}
        </AntMenu.Item>
      </AntMenu>
    </div>
  )
}
