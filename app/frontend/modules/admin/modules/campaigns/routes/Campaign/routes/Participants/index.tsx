import React from 'react'
import { Menu } from 'antd'
import { History } from 'history'
import { connect, ConnectedProps } from 'react-redux'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import RouteList from '~/components/RouteList'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'

export { default as Subjects } from './Subjects'
export { default as Assessors } from './Assessors'
export { SmsInvites } from './SmsInvites'

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

const ParticipantComponent: React.FC<Props> = ({ campaignPermissions, history, routes }) => {
  const prefix = `${settings.urlPrefix}/:campaignId`
  const onSelect = ({ key }) => routeUtils.moveTo(history, prefix, key)
  const menuItems: ItemType[] = [{
    key: '/participants/subjects',
    label: I18n.t('administration.participants.tabs.subjects'),
  }]
  campaignPermissions.viewAssessors && menuItems.push({
    key: '/participants/assessors',
    label: I18n.t('administration.participants.tabs.assessors'),
  })
  campaignPermissions.viewSmsInvites && menuItems.push({
    key: '/participants/sms/invites',
    label: I18n.t('administration.participants.tabs.sms_invites'),
  })

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={getActiveLocationPath()}
        mode="horizontal"
      />
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}

const getActiveLocationPath = (): Array<string> => {
  if (location.href.match(/participants\/subjects/)) {
    return ['/participants/subjects']
  }
  if (location.href.match(/participants\/assessors/)) {
    return ['/participants/assessors']
  }
  if (location.href.match(/participants\/(sms\/invites|sms\/history)/)) {
    return ['/participants/sms/invites']
  }
  return ['']
}

export const Participants = connector(ParticipantComponent)
