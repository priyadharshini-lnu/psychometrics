import React from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart, Settings } from '@thetalententerprise/glint/icons'
import { RootState } from '~/modules/admin/core/rootReducers'
import { usePageHeld } from '~/components/PageFallback'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
  campaignPermissions: getCurrentCampaign(state).permissions,
}))

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const ScoringComponent: React.FC<Props> = ({ campaignPermissions }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const held = usePageHeld()
  const prefix = `${settings.urlPrefix}/:campaignId/scoring`
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)
  const menuItems = [
    ...(campaignPermissions.viewCampaignScoring ? [{
      key: '/subject_scores',
      icon: <BarChart />,
      label: I18n.t('admin.scoring_tabs_subject_scores'),
    }] : []),
    ...(campaignPermissions.viewCampaignScoringSetting ? [{
      key: '/settings',
      icon: <Settings />,
      label: I18n.t('admin.scoring_tabs_settings'),
    }] : [])]

  const activeTab = menuItems.find(({ key }) => pathname.includes(key))

  return (
    <div>
      {!held && menuItems.length > 1 && (
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={activeTab ? [activeTab.key] : []}
          mode="horizontal"
        />
      )}
      <Outlet />
    </div>
  )
}

export const Scoring = connector(ScoringComponent)
