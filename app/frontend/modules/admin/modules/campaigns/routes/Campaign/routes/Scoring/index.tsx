import React from 'react'
import { Menu } from 'antd'
import { History } from 'history'
import { connect, ConnectedProps } from 'react-redux'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import RouteList from '~/components/RouteList'
import { RootState } from '~/modules/admin/core/rootReducers'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'

export { ScoringGroups } from './ScoringGroups'
export { SubjectScoresList } from './SubjectScores'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
}))

interface OwnProps {
  routes: Array<{ path: string, components: JSX.Element }>,
  history: History
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

const ScoringComponent: React.FC<Props> = ({ history, routes }) => {
  const prefix = `${settings.urlPrefix}/:campaignId`
  const onSelect = ({ key }) => routeUtils.moveTo(history, prefix, key)
  const menuItems: ItemType[] = [{
    key: '/scoring/subject_scores',
    label: I18n.t('administration.scoring.tabs.subject_scores'),
  },
  {
    key: '/scoring/settings',
    label: I18n.t('administration.scoring.tabs.settings'),
  }]

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      />
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}

export const Scoring = connector(ScoringComponent)
