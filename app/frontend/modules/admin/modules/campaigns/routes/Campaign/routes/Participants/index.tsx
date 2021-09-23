import React from 'react'
import { Menu } from 'antd'
import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'
import settings from '../../../../settings'

export { default as Subjects } from './Subjects'
export { default as Assessors } from './Assessors'
export { SmsInvites } from './SmsInvites'

const { I18n } = window

export const Participants = ({ history, routes }) => {
  const prefix = `${settings.urlPrefix}/:campaignId`
  const onSelect = ({ key }) => routeUtils.moveTo(history, prefix, key)

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        <Menu.Item key="/participants/subjects">{I18n.t('administration.participants.tabs.subjects')}</Menu.Item>
        <Menu.Item key="/participants/assessors">{I18n.t('administration.participants.tabs.assessors')}</Menu.Item>
        <Menu.Item key="/participants/sms_invites">{I18n.t('administration.participants.tabs.sms_invites')}</Menu.Item>
      </Menu>
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}
