import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { Description, Outbox } from '@thetalententerprise/glint/icons'
import RouteList from '~/components/RouteList'
import { DocumentTitle } from '~/components/DocumentTitle'
import { MenuItem } from '~/interfaces/Antd'
import routeUtils from '~/utils/route'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import { Templates } from './Templates'
import { Deliveries } from './Deliveries'
import { DeliveryEmails } from './DeliveryEmails'

const { I18n } = window

const getActiveLocationPath = (pathname: string): string[] => {
  if (pathname.includes('/communication_center/deliveries')) {
    return ['/communication_center/deliveries']
  }
  return ['/communication_center/templates']
}

export const CommunicationCenter: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefix = `${settings.urlPrefix}/:projectId`

  const menuItems: MenuItem[] = [
    {
      key: '/communication_center/templates',
      icon: <Description />,
      label: I18n.t('admin.communication_templates'),
    },
    {
      key: '/communication_center/deliveries',
      icon: <Outbox />,
      label: I18n.t('admin.communication_deliveries'),
    },
  ]

  return (
    <div>
      <DocumentTitle text={I18n.t('admin.communication_center')} />
      <Menu
        items={menuItems}
        onSelect={({ key }) => routeUtils.moveTo(navigate, prefix, key)}
        selectedKeys={getActiveLocationPath(pathname)}
        mode="horizontal"
      />
      <RouteList
        routes={[
          { redirect: true, from: '', to: 'templates' },
          { path: '/templates', component: <Templates /> },
          { path: '/deliveries', component: <Deliveries /> },
          { path: '/deliveries/:id', component: <DeliveryEmails /> },
        ]}
        urlPrefix=""
      />
    </div>
  )
}
