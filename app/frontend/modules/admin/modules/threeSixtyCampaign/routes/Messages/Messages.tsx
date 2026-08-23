import { ReactNode, useMemo } from 'react'
import { Menu } from 'antd'
import { connect } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  History, Mail, MenuBook, Settings,
} from '@thetalententerprise/glint/icons'
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

const TAB_ICONS: Record<string, ReactNode> = {
  email: <Mail />,
  instructions: <MenuBook />,
  mail_histories: <History />,
  options: <Settings />,
}

function Messages ({ campaignPermissions }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems = useMemo(() => permittedMessagesTabs(campaignPermissions).map(({ id, labelKey }) => ({
    id,
    key: `/messages/${id}`,
    icon: TAB_ICONS[id],
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
        {menuItems.length > 1 && (
          <Menu
            items={menuItems}
            onSelect={onSelect}
            selectedKeys={activeTab ? [activeTab.key] : []}
            mode="horizontal"
          />
        )}
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
