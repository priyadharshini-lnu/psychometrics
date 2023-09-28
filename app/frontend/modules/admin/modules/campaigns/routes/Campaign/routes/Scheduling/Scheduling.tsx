import React from 'react'
import { Menu } from 'antd'
import { History } from 'history'
import { connect, ConnectedProps } from 'react-redux'
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

const SchedulingComponent: React.FC<Props> = ({ history, routes, campaignPermissions }) => {
  const prefix = `${settings.urlPrefix}/:campaignId`
  const onSelect = ({ key }) => routeUtils.moveTo(history, prefix, key)

  const menuItems = () => ([
    campaignPermissions.viewWorkshops ? {
      key: '/scheduling/assessment_center',
      label: I18n.t('administration.scheduling.tabs.assessment_center'),
    } : null,
    campaignPermissions.viewWorkshopInvites ? {
      key: '/scheduling/invites',
      label: I18n.t('administration.scheduling.tabs.invites'),
    } : null,
  ]).filter(Boolean)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Menu
          items={menuItems()}
          onSelect={onSelect}
          selectedKeys={getActiveLocationPath()}
          mode="horizontal"
          className="w-100"
        />
      </div>
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}

const getActiveLocationPath = (): Array<string> => {
  if (location.href.match(/scheduling\/assessment_center/)) {
    return ['/scheduling/assessment_center']
  }
  if (location.href.match(/scheduling\/(requests|invites)/)) {
    return ['/scheduling/invites']
  }
  return ['']
}

export const Scheduling = connector(SchedulingComponent)
