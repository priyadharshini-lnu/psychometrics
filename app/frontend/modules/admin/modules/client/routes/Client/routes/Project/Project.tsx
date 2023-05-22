import React, { FC, useEffect } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  SettingOutlined,
  ShopOutlined,
  DatabaseOutlined,
  // UserOutlined,
  SolutionOutlined,
} from '@ant-design/icons'
import some from 'lodash/some'
import { connect, ConnectedProps } from 'react-redux'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import {
  fetchSingle as fetchProject,
} from '~/modules/admin/modules/client/core/projects'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import RouteList from '~/components/RouteList'
import { RootState } from '~/modules/admin/core/rootReducers'
import { routes } from './routes'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
  {
    fetchProject,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const ProjectComponent: FC<Props> = ({
  currentUser, fetchProject,
}) => {
  const { projectId } = useParams<{ projectId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()

  useEffect(() => {
    fetchProject(parseInt(projectId, 10))
  }, [])

  const handleOnSelect = ({ key }) => {
    history.push(`${settings.urlPrefix}/${projectId}/${key}`)
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

  const canShowSettingsTab = () => {
    const permissions = ['manageProjectSmtpSettings', 'manageProjectSamlSetting', 'manageProjectIntegrations']
    return some(permissions, permission => currentUser.permissions[permission])
  }

  const menuItems: ItemType[] = [
    { key: 'new_campaigns', icon: <ShopOutlined />, label: I18n.t('common.model.campaigns') },
    { key: 'datasheet', icon: <DatabaseOutlined />, label: I18n.t('common.model.datasheet') },
  ]
  currentUser.permissions.manageProjectAdmins && menuItems.push({
    key: 'admins',
    icon: <SolutionOutlined />,
    label: I18n.t('administration.breadcrumbs.project_admins'),
  })
  canShowSettingsTab() && menuItems.push({
    key: 'settings',
    icon: <SettingOutlined />,
    label: I18n.t('administration.breadcrumbs.settings'),
  })

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
            link: state => `/administration/projects/${state.project?.id}/new_campaigns?filters[statusEq]=active`,
            label: state => state.project?.name,
          },
          {
            label: () => getPageTitle(pathname),
          },
        ]}
      />
      <Menu
        items={menuItems}
        onSelect={handleOnSelect}
        selectedKeys={getActiveMenuKey(pathname)}
        mode="horizontal"
      />
      <RouteList
        routes={routes}
        urlPrefix={`${settings.urlPrefix}/:projectId`}
      />
    </div>
  )
}

export const Project = connecter(ProjectComponent)
