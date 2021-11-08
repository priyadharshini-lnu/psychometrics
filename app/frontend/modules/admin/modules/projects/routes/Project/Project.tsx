import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers.ts'
import { Menu } from 'antd'
import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'
import settings from 'modules/admin/modules/projects/settings'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import { useParams } from 'react-router'

import { routes } from './routes'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux & RouteComponentProps

const ProjectComponent: React.FC<Props> = ({ currentUser, history }) => {
  const prefix = `${settings.urlPrefix}/:projectId`
  const { projectId } = useParams<{ projectId: string}>()
  const path = routeUtils.getActiveRoutePath(routes)
  const showBreadcrumbs = ['/new_campaigns', '/datasheet', '/settings'].includes(path)
  const pageName = () => ({
    '/new_campaigns': I18n.t('common.model.campaigns'),
    '/datasheet': I18n.t('common.model.datasheet'),
    '/settings': I18n.t('administration.breadcrumbs.settings'),
  }[path])

  const onSelect = ({ key }) => {
    if (key === 'project_admins') {
      window.location.pathname = `/administration/clients/${projectId}/project_admins`
    } else {
      routeUtils.moveTo(history, prefix, key)
    }
  }

  const activePath = () => {
    const path = routeUtils.getActiveRoutePath(routes)
    if (path.includes('/settings')) { return '/settings/smtp' }

    return path
  }

  return (
    <div>
      {showBreadcrumbs && (
      <Breadcrumb
        request={{
          fields: ['project', 'client'],
          data: {
            projectId: parseInt(projectId, 10),
          },
        }}
        crumbs={[{
          link: () => '/administration',
          label: () => I18n.t('administration.clients.tenancies'),
        }, {
          link: state => `/administration/clients/${state.client.id}/projects`,
          label: state => state.client.name,
        }, {
          link: state => `/administration/projects/${state.project.id}/new_campaigns`,
          label: state => state.project.name,
        }, {
          label: () => pageName(),
        }]}
      />
      )}
      <Menu onSelect={onSelect} selectedKeys={[activePath()]} mode="horizontal">
        <Menu.Item key="/new_campaigns">{I18n.t('common.model.campaigns')}</Menu.Item>
        <Menu.Item key="/datasheet">{I18n.t('common.model.datasheet')}</Menu.Item>
        {currentUser.permissions.manageAdmins && (
          <Menu.Item key="project_admins">{I18n.t('administration.breadcrumbs.project_admins')}</Menu.Item>
        )}
        {currentUser.permissions.manageProjectSmtpSettings && (
          <Menu.Item key="/settings/smtp">{I18n.t('administration.breadcrumbs.settings')}</Menu.Item>
        )}
      </Menu>
      <RouteList routes={routes} urlPrefix={prefix} />
    </div>
  )
}

export const Project = connecter(ProjectComponent)
