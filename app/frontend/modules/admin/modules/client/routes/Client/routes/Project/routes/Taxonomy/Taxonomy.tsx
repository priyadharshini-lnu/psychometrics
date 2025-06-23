import { FC } from 'react'
import { Menu } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import JobRoles from '~/modules/admin/modules/SkillsTaxonomy/components/JobRoles'
import { MenuItem } from '~/interfaces/Antd'
import RouteList from '~/components/RouteList'
import routeUtils from '~/utils/route'
import Proficiency from '~/modules/admin/modules/SkillsTaxonomy/components/Proficiency'
import JobRoleSkillMapping from '~/modules/admin/modules/SkillsTaxonomy/components/JobRoleSkillMapping'
import SkillList from '~/modules/admin/modules/SkillsTaxonomy/components/SkillList'
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
  const { projectId } = useParams() as { projectId: string }
  const skillRaterEnabled = features?.skillRaterEnabled

  const routes = [
    { redirect: true, from: '', to: `/admin/projects/${projectId}/taxonomy/skills` },
    {
      path: '/skills',
      component: <SkillList />,
    },
    skillRaterEnabled ? {
      path: '/job_roles',
      component: <JobRoles />,
    } : null,
    skillRaterEnabled ? {
      path: '/skill_job_mappings',
      component: <JobRoleSkillMapping />,
    } : null,
    skillRaterEnabled ? {
      path: '/proficiency',
      component: <Proficiency />,
    } : null,
  ].filter(Boolean)

  const onSelect = ({ key }) => {
    navigate(`/admin/projects/${projectId}/taxonomy${key}`)
  }
  const menuItems: MenuItem[] = []

  menuItems.push({
    key: '/skills',
    label: I18n.t('administration.taxonomy.skills'),
  })

  if (skillRaterEnabled) {
    menuItems.push({
      key: '/job_roles',
      label: I18n.t('administration.taxonomy.job_roles'),
    })

    menuItems.push({
      key: '/skill_job_mappings',
      label: I18n.t('administration.taxonomy.skill_job_mappings'),
    })

    menuItems.push({
      key: '/proficiency',
      label: I18n.t('administration.taxonomy.proficiency'),
    })
  }

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

export const Taxonomy = connector(TaxonomyComponent)
export default Taxonomy
