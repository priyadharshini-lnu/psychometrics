import { FC, ReactNode } from 'react'
import { Menu } from 'antd'
import {
  Outlet, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import {
  Bolt, Folder, Mic, Quiz, Settings,
} from '@thetalententerprise/glint/icons'
import { RootState } from '~/modules/admin/core/rootReducers'
import { permittedIdpTabs } from './routes'
import User from '~/modules/admin/modules/campaigns/interfaces/User'
import { get as getCurrentUser } from '~/core/currentUser'

const { I18n } = window

const TAB_ICONS: Record<string, ReactNode> = {
  templates: <Folder />,
  settings: <Settings />,
  development_actions: <Bolt />,
  reflection_questions: <Quiz />,
  interview_questions: <Mic />,
}

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
  const { pathname } = useLocation()
  const { projectId } = useParams() as { projectId: string }

  const onSelect = ({ key }) => {
    navigate(`/admin/projects/${projectId}/idp/${key}`)
  }

  const menuItems = permittedIdpTabs(currentUser).map(({ key, labelKey }) => ({
    key,
    icon: TAB_ICONS[key],
    label: I18n.t(labelKey),
  }))

  const activeTab = menuItems.find(({ key }) => pathname.includes(`/${key}`))

  return (
    <div>
      {menuItems.length > 1 && (
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={activeTab ? [activeTab.key] : []}
          mode="horizontal"
        />
      )}
      <Outlet />
    </div>
  )
}

export const Idp = connecter(IdpComponent)
