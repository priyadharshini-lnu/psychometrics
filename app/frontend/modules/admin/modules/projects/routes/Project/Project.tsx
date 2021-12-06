import React, { FC } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { Menu } from 'antd'
import {
  SettingOutlined,
  ShopOutlined,
  DatabaseOutlined,
  // UserOutlined,
  SolutionOutlined,
} from '@ant-design/icons'

import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import settings from 'modules/admin/modules/projects/settings'
import RouteList from 'components/RouteList'
import { connect, ConnectedProps } from 'react-redux'
import { routes } from './routes'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const ProjectComponent: FC<Props> = ({ currentUser }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()

  const handleOnSelect = ({ key }) => {
    if (key === 'admins') {
      window.location.pathname = `/administration/clients/${projectId}/project_admins`
    } else {
      history.push(`${settings.urlPrefix}/${projectId}/${key}`)
    }
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    // includes only primary level tabs and not secondary tabs
    if (pathname.includes('/new_campaigns')) {
      return ['new_campaigns']
    }
    if (pathname.includes('/users')) {
      return ['users']
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
      case 'users': {
        if (pathname.includes('participants')) {
          return I18n.t('administration.breadcrumbs.participants')
        }
        if (pathname.includes('assessors')) {
          return I18n.t('administration.breadcrumbs.assessors')
        }
        return I18n.t('administration.breadcrumbs.users')
      }
      case 'datasheet':
        return I18n.t('common.model.datasheet')
      case 'settings': {
        if (pathname.includes('smtp')) {
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
        <Menu.Item key="new_campaigns" icon={<ShopOutlined />}>
          {I18n.t('common.model.campaigns')}
        </Menu.Item>
        {/* Uncomment tabs when API changes are available */}
        {/* <Menu.Item key="users" icon={<UserOutlined />}>
          {I18n.t('administration.breadcrumbs.users')}
        </Menu.Item> */}
        <Menu.Item key="datasheet" icon={<DatabaseOutlined />}>
          {I18n.t('common.model.datasheet')}
        </Menu.Item>
        {currentUser.permissions.manageAdmins && (
          <Menu.Item key="admins" icon={<SolutionOutlined />}>
            {I18n.t('administration.breadcrumbs.project_admins')}
          </Menu.Item>
        )}
        {currentUser.permissions.manageProjectSmtpSettings && (
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            {I18n.t('administration.breadcrumbs.settings')}
          </Menu.Item>
        )}
      </Menu>
      <RouteList
        routes={routes}
        urlPrefix={`${settings.urlPrefix}/:projectId`}
      />
    </div>
  )
}

export const Project = connecter(ProjectComponent)
