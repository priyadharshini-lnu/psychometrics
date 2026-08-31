import { FC, ReactNode } from 'react'
import { Menu } from 'antd'
import {
  Outlet, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import {
  Badge, Handyman, Lightbulb, Star,
} from '@thetalententerprise/glint/icons'
import { getFeatures } from '~/core/config'
import { RootState } from '~/modules/admin/core/rootReducers'

const { I18n } = window

const mapState = (state: RootState) => ({
  features: getFeatures(state),
})

const connector = connect(mapState)

type PropsFromRedux = ConnectedProps<typeof connector>

const TaxonomyComponent: FC<PropsFromRedux> = ({ features }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { projectId } = useParams() as { projectId: string }
  const skillRaterEnabled = features?.skillRaterEnabled

  const onSelect = ({ key }) => {
    navigate(`/admin/projects/${projectId}/taxonomy/${key}`)
  }
  const menuItems: { key: string, icon: ReactNode, label: string }[] = []

  menuItems.push({
    key: 'skills',
    icon: <Lightbulb />,
    label: I18n.t('admin.skills'),
  })

  if (skillRaterEnabled) {
    menuItems.push({
      key: 'job_roles',
      icon: <Badge />,
      label: I18n.t('admin.job_roles'),
    })

    menuItems.push({
      key: 'proficiency',
      icon: <Star />,
      label: I18n.t('admin.proficiency'),
    })

    menuItems.push({
      key: 'settings',
      icon: <Handyman />,
      label: I18n.t('admin.tools'),
    })
  }

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

export const Taxonomy = connector(TaxonomyComponent)
export default Taxonomy
