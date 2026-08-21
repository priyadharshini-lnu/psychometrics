import { useMemo } from 'react'
import { Menu } from 'antd'
import { connect } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getCurrentCampaign,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import PipedTextModal from '~/components/Editor/PipedTextModal'
import routeUtils from '~/utils/route'
import settings from '../../settings'
import { PageHeader } from '../../PageHeader'
import { permittedMessagesTabs } from './routes'

const { I18n } = window

function Messages ({ campaignPermissions }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems = useMemo(() => permittedMessagesTabs(campaignPermissions).map(({ id, labelKey }) => ({
    id,
    key: `/messages/${id}`,
    label: I18n.t(labelKey),
  })), [campaignPermissions])

  const activeTab = menuItems.find(({ id }) => pathname.includes(`/${id}`))

  const onSelect = ({ key }) => {
    routeUtils.moveTo(navigate, settings.urlPrefix, key)
  }

  return (
    <>
      <PageHeader />
      <div>
        <Menu
          items={menuItems}
          onSelect={onSelect}
          selectedKeys={activeTab ? [activeTab.key] : []}
          mode="horizontal"
        />
        <Outlet />
        <PipedTextModal />
      </div>
    </>
  )
}
const connector = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
)

export default connector(Messages)
