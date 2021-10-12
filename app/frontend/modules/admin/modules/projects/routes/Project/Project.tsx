import React, { FC } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  SettingOutlined,
  ShopOutlined,
  DatabaseOutlined,
  // SolutionOutlined,
} from '@ant-design/icons'

import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import settings from 'modules/admin/modules/projects/settings'
import RouteList from 'components/RouteList'
import { routes } from './routes'

const { I18n } = window

export const Project: FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()

  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/${projectId}/${key}`)
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    // includes only primary level tabs and not secondary tabs
    if (pathname.includes('/new_campaigns')) {
      return ['new_campaigns']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/datasheet')) {
      return ['datasheet']
    }
    if (pathname.includes('/settings')) {
      return ['settings']
    }
    return undefined
  }

  const getPageTitle = (pathname: string): string => {
    const primaryLevelTab = getActiveMenuKey(pathname)
    if (primaryLevelTab === undefined) {
      return ''
    }

    const [primaryTab] = primaryLevelTab
    switch (primaryTab) {
      case 'new_campaigns':
        return I18n.t('common.model.campaigns')
      case 'admins':
        return I18n.t('administration.breadcrumbs.admins')
      case 'users':
        return I18n.t('administration.breadcrumbs.users')
      case 'datasheet':
        return I18n.t('common.model.datasheet')
      case 'settings': {
        if (pathname.includes('/settings/smtp')) {
          return I18n.t('administration.breadcrumbs.smtp_settings')
        }
        return I18n.t('administration.breadcrumbs.settings')
      }
      default:
        return ''
    }
  }

  return (
    <div>
      <Breadcrumb
        request={{
          fields: ['project', 'client'],
          data: {
            projectId: parseInt(projectId, 10),
          },
        }}
        crumbs={[
          {
            link: () => '/administration',
            label: () => I18n.t('administration.clients.tenancies'),
          },
          {
            link: state => `/administration/clients/${state.client.id}/projects`,
            label: state => state.client.name,
          },
          {
            link: state => `/administration/projects/${state.project.id}/new_campaigns`,
            label: state => state.project.name,
          },
          {
            label: () => getPageTitle(pathname),
          },
        ]}
      />
      <Menu
        onSelect={handleOnSelect}
        selectedKeys={getActiveMenuKey(pathname)}
        mode="horizontal"
      >
        <Menu.Item key="new_campaigns">
          <ShopOutlined />
          {I18n.t('common.model.campaigns')}
        </Menu.Item>
        {/* <Menu.Item key="admins">
          <SolutionOutlined />
          {I18n.t('administration.breadcrumbs.admins')}
        </Menu.Item> */}
        <Menu.Item key="datasheet">
          <DatabaseOutlined />
          {I18n.t('common.model.datasheet')}
        </Menu.Item>
        <Menu.Item key="settings">
          <SettingOutlined />
          {I18n.t('administration.breadcrumbs.settings')}
        </Menu.Item>
      </Menu>
      <RouteList
        routes={routes}
        urlPrefix={`${settings.urlPrefix}/:projectId`}
      />
    </div>
  )
}
