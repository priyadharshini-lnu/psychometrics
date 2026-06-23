import React from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
import { Weightages } from './Weigthages'
import RouteList from '~/components/RouteList'
import { RootState } from '~/modules/admin/core/rootReducers'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'

import { ScoringGroups } from './ScoringGroups'
import { SubjectScoresList } from './SubjectScores'

export { SubjectScoresList } from './SubjectScores'
export { ScoringGroups } from './ScoringGroups'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
  campaignPermissions: getCurrentCampaign(state).permissions,
}))

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const routes = [
  { redirect: true, from: '', to: 'subject_scores' },
  { path: '/subject_scores', component: <SubjectScoresList /> },
  { path: '/settings', component: <ScoringGroups /> },
  { path: '/settings/weightages', component: <Weightages /> },
]

const ScoringComponent: React.FC<Props> = ({ campaignPermissions }) => {
  const navigate = useNavigate()
  const prefix = `${settings.urlPrefix}/:campaignId/scoring`
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)
  const menuItems: MenuItem[] = [
    ...(campaignPermissions.viewCampaignScoring ? [{
      key: '/subject_scores',
      label: I18n.t('admin.scoring_tabs_subject_scores'),
    }] : []),
    ...(campaignPermissions.viewCampaignScoringSetting ? [{
      key: '/settings',
      label: I18n.t('admin.scoring_tabs_settings'),
    }] : [])]

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      />
      <RouteList
        routes={routes}
        urlPrefix=""
      />
    </div>
  )
}

export const Scoring = connector(ScoringComponent)
