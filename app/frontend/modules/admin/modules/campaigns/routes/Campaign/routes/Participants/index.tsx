import React from 'react'
import { Menu } from 'antd'
import { History } from 'history'
import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'
import { RootState } from 'modules/admin/core/rootReducers'
import { connect, ConnectedProps } from 'react-redux'
import { get as getCurrentCampaign } from 'modules/admin/modules/campaigns/core/current'
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

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/participants/subjects">{I18n.t('administration.participants.tabs.subjects')}</Menu.Item>
        <Menu.Item key="/participants/assessors">{I18n.t('administration.participants.tabs.assessors')}</Menu.Item>
        {campaignPermissions.viewSmsInvites && (
          <Menu.Item key="/participants/sms_invites">
            {I18n.t('administration.participants.tabs.sms_invites')}
          </Menu.Item>
        )}
      </Menu>
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}

export const Participants = connector(ParticipantComponent)
