import { FC } from 'react'
import { Menu } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { MenuItem } from '~/interfaces/Antd'
import RouteList from '~/components/RouteList'
import routeUtils from '~/utils/route'
import SkillList from '~/modules/admin/modules/Skills/components/SkillList'

const { I18n } = window

export const Taxonomy: FC = () => {
  const navigate = useNavigate()
  const { projectId } = useParams() as { projectId: string }

  const routes = [
    { redirect: true, from: '', to: `/admin/projects/${projectId}/taxonomy/skills` },
    {
      path: '/skills',
      component: <SkillList />,
    },
  ]

  const onSelect = ({ key }) => {
    navigate(`/admin/projects/${projectId}/taxonomy${key}`)
  }
  const menuItems: MenuItem[] = []

  menuItems.push({
    key: '/skills',
    label: I18n.t('administration.taxonomy.skills'),
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
