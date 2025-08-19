import { connect, ConnectedProps } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  MessageOutlined,
  SolutionOutlined,
} from '@ant-design/icons'

import { MenuItem } from '~/interfaces/Antd'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getCurrentCampaign,
} from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

import routeUtils from '~/utils/route'
import settings from '../settings'

const { I18n } = window

type PropsFromRedux = ConnectedProps<typeof connector>

function TopMenuComponent ({ campaignPermissions }: PropsFromRedux) {
  const { pathname } = useLocation()

  const navigate = useNavigate()

  const handleOnSelect = ({ key }) => {
    const basePath = routeUtils.getBasePath(settings.urlPrefix)
    navigate(`${basePath}/${key}`)
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/participants')) {
      return ['participants']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/messages')) {
      return ['messages']
    }
    if (pathname.includes('/reports')) {
      return ['reports']
    }
    if (pathname.includes('/datasheet')) {
      return ['datasheet']
    }
    return undefined
  }
  const menuItems: MenuItem[] = [{
    key: 'participants',
    icon: <UserOutlined />,
    label: I18n.t('administration.threesixty_campaigns.menu.participants.title'),
  }]
  if (campaignPermissions.accessEmailMessages
    || campaignPermissions.accessMessagesOptions
    || campaignPermissions.accessInstructionMessages) {
    menuItems.push({
      key: 'messages',
      icon: <MessageOutlined />,
      label: I18n.t('administration.threesixty_campaigns.menu.messages.title'),
    })
  }
  campaignPermissions.editReportOptions && menuItems.push({
    key: 'reports',
    icon: <PieChartOutlined />,
    label: I18n.t('administration.threesixty_campaigns.menu.report.title'),
  })
  campaignPermissions.viewDatasheets && menuItems.push({
    key: 'datasheet',
    icon: <DatabaseOutlined />,
    label: I18n.t('administration.threesixty_campaigns.menu.datasheet.title'),
  })

  campaignPermissions.manageAdmins && menuItems.push({
    key: 'admins',
    label: I18n.t('common.model.admins'),
    icon: <SolutionOutlined />,
  })

  return (
    <Menu
      items={menuItems}
      onSelect={handleOnSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      mode="horizontal"
    />
  )
}


const connector = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
)
export const TopMenu = connector(TopMenuComponent)
