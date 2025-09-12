import { FC } from 'react'
import { Menu } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import RouteList from '~/components/RouteList'
import { RootState } from '~/modules/admin/core/rootReducers'
import routeUtils from '~/utils/route'
import { routes } from './routes'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state) as User,
  }),
  {
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>

const IdpComponent: FC<PropsFromRedux> = ({ currentUser }) => {
  const navigate = useNavigate()
  const { projectId } = useParams() as { projectId: string }

  const onSelect = ({ key }) => {
    navigate(`/admin/projects/${projectId}/idp${key}`)
  }
  const menuItems: MenuItem[] = []

  currentUser.permissions.accessIdpTemplates && menuItems.push({
    key: '/templates',
    label: I18n.t('administration.idp.tab.templates'),
  })

  isSuperAdmin(currentUser) && menuItems.push({
    key: '/settings',
    label: I18n.t('administration.idp.tab.settings'),
  })

  currentUser.permissions.accessProjectDevelopmentActions && menuItems.push({
    key: '/development_actions',
    label: I18n.t('administration.idp.tab.development_actions'),
  })

  currentUser.permissions.accessReflectionQuestions && menuItems.push({
    key: '/reflection_questions',
    label: I18n.t('administration.idp.tab.reflection_questions'),
  })

  currentUser.permissions.accessReflectionQuestions && menuItems.push({
    key: '/interview_questions',
    label: I18n.t('administration.idp.tab.interview_questions'),
  })


  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
        mode="horizontal"
      />
      <RouteList routes={routes} urlPrefix="" />
    </div>
  )
}

export const Idp = connecter(IdpComponent)
