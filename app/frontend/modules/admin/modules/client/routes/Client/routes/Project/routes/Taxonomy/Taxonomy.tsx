import { FC } from 'react'
import { Menu } from 'antd'
import {
  Outlet, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
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
  const menuItems: { key: string, label: string }[] = []

  menuItems.push({
    key: 'skills',
    label: I18n.t('admin.skills'),
  })

  if (skillRaterEnabled) {
    menuItems.push({
      key: 'job_roles',
      label: I18n.t('admin.job_roles'),
    })

    menuItems.push({
      key: 'proficiency',
      label: I18n.t('admin.proficiency'),
    })

    menuItems.push({
      key: 'settings',
      label: I18n.t('admin.tools'),
    })
  }

  const activeTab = menuItems.find(({ key }) => pathname.includes(`/${key}`))

  return (
    <div>
      <Menu
        items={menuItems}
        onSelect={onSelect}
        selectedKeys={activeTab ? [activeTab.key] : []}
        mode="horizontal"
      />
      <Outlet />
    </div>
  )
}

export const Taxonomy = connector(TaxonomyComponent)
export default Taxonomy
