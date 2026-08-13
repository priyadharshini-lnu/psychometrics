import React from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
  campaignPermissions: getCurrentCampaign(state).permissions,
}))

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const ParticipantComponent: React.FC<Props> = ({ campaignPermissions }) => {
  const navigate = useNavigate()
  const prefix = `${settings.urlPrefix}/:campaignId`
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)
  const menuItems: MenuItem[] = [{
    key: '/participants/subjects',
    label: I18n.t('admin.participants_tabs_subjects'),
  }]
  campaignPermissions.viewAssessors && menuItems.push({
    key: '/participants/assessors',
    label: I18n.t('admin.participants_tabs_assessors'),
  })
  campaignPermissions.viewSmsInvites && menuItems.push({
    key: '/participants/sms/invites',
    label: I18n.t('admin.participants_tabs_sms_contacts'),
  })

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={getActiveLocationPath()}
        mode="horizontal"
      />
      <Outlet />
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
