import React from 'react'
import { Menu } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'
import { Event, Mail } from '@thetalententerprise/glint/icons'
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

const SchedulingComponent: React.FC<Props> = ({ campaignPermissions }) => {
  const prefix = `${settings.urlPrefix}/:campaignId`
  const navigate = useNavigate()
  const onSelect = ({ key }) => routeUtils.moveTo(navigate, prefix, key)

  const menuItems = [
    campaignPermissions.viewWorkshops ? {
      key: '/scheduling/assessment_center',
      icon: <Event />,
      label: I18n.t('admin.scheduling_tabs_assessment_center'),
    } : null,
    campaignPermissions.viewWorkshopInvites ? {
      key: '/scheduling/invites',
      icon: <Mail />,
      label: I18n.t('admin.scheduling_tabs_invites'),
    } : null,
  ].filter(Boolean)

  return (
    <div>
      {menuItems.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Menu
            items={menuItems}
            onSelect={onSelect}
            selectedKeys={getActiveLocationPath()}
            mode="horizontal"
            className="w-100"
          />
        </div>
      )}
      <Outlet />
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
