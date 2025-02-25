import { FC } from 'react'
import { Menu } from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { useNavigate, useParams } from 'react-router-dom'
import RouteList from '~/components/RouteList'
import routeUtils from '~/utils/route'
import { routes } from './routes'

const { I18n } = window

export const IdpComponent: FC = () => {
  const navigate = useNavigate()
  const { projectId } = useParams() as { projectId: string }

  const onSelect = ({ key }) => {
    navigate(`/admin/projects/${projectId}/idp${key}`)
  }
  const menuItems: ItemType[] = []

  menuItems.push({
    key: '/templates',
    label: I18n.t('administration.idp.tab.templates'),
  }, {
    key: '/settings',
    label: I18n.t('administration.idp.tab.settings'),
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

export const Idp = IdpComponent
