import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { Description, Outbox } from '@thetalententerprise/glint/icons'
import RouteList from '~/components/RouteList'
import { DocumentTitle } from '~/components/DocumentTitle'
import { MenuItem } from '~/interfaces/Antd'
import routeUtils from '~/utils/route'
import settings from '../../../../settings'
import { CommunicationTemplates } from './CommunicationTemplates'
import { Communications } from './Communications'
import { CommunicationsEmails } from './CommunicationEmails'

const { I18n } = window

const getActiveLocationPath = (pathname: string): string[] => {
  if (pathname.includes('/communication_center/communications')) {
    return ['/communication_center/communications']
  }
  return ['/communication_center/templates']
}

export const CommunicationCenter: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefix = `${settings.urlPrefix}/:campaignId`

  const menuItems: MenuItem[] = [
    {
      key: '/communication_center/templates',
      icon: <Description />,
      label: I18n.t('admin.communication_templates'),
    },
    {
      key: '/communication_center/communications',
      icon: <Outbox />,
      label: I18n.t('admin.communications'),
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
          { path: '/templates', component: <CommunicationTemplates /> },
          { path: '/communications', component: <Communications /> },
          { path: '/communications/:id', component: <CommunicationsEmails /> },
        ]}
        urlPrefix=""
      />
    </div>
  )
}
