import React from 'react'
import { Menu } from 'antd'
import { History } from 'history'
import { connect, ConnectedProps } from 'react-redux'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import moment, { Moment } from 'moment'
import RouteList from '~/components/RouteList'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
  campaignPermissions: getCurrentCampaign(state).permissions,
}))

interface OwnProps {
  routes: Array<{ path: string, components: JSX.Element }>,
  history: History
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

const SchedulingComponent: React.FC<Props> = ({ history, routes }) => {
  const prefix = `${settings.urlPrefix}/:campaignId`
  const onSelect = ({ key }) => routeUtils.moveTo(history, prefix, key)

  const CURRENT_WEEK: [Moment, Moment] = [
    moment().startOf('w'),
    moment().endOf('w'),
  ]
  const menuItems: ItemType[] = [{
    key: encodeURI(
      `/scheduling/assessment_center?q[filter][start_time_between]=${CURRENT_WEEK.toString()}`,
    ),
    label: I18n.t('administration.scheduling.tabs.assessment_center'),
  },
  {
    key: '/scheduling/invites',
    label: I18n.t('administration.scheduling.tabs.invites'),
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

export const Scheduling = connector(SchedulingComponent)
