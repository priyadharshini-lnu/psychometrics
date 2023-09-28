import { Menu } from 'antd'
import { connect } from 'react-redux'
import RouteList from '~/components/RouteList'
import { get as getCurrentUser } from '~/core/currentUser'
import routeUtils from '~/utils/route'
import settings from '../../settings'
import { PageHeader } from '../../PageHeader'

function Participants ({ history, routes, currentUser }) {
  const onSelect = ({ key }) => routeUtils.moveTo(history, settings.urlPrefix, key)
  const menuItems = [{ key: '/participants', label: 'Participants' }]
  currentUser.permissions.editParticipantOptions && menuItems.push({
    key: '/participants/options',
    label: 'Options',
  })
  return (
    <>
      <PageHeader />
      <div>
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={[routeUtils.getActiveRoutePath(routes)]}
          mode="horizontal"
        />
        <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
      </div>
    </>
  )
}

export default connect(state => ({
  currentUser: getCurrentUser(state),
}), {})(Participants)
