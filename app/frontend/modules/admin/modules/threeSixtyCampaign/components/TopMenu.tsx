import { connect, ConnectedProps } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  MessageOutlined,
  SolutionOutlined,
  RobotOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

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
    if (pathname.includes('/ai_artifacts')) {
      return ['ai_artifacts']
    }
    return undefined
  }
  const menuItems: MenuItem[] = [{
    key: 'participants',
    icon: <UserOutlined />,
    label: I18n.t('admin.threesixty_campaigns_menu_participants_title'),
  }]
  if (campaignPermissions.accessEmailMessages
    || campaignPermissions.accessMessagesOptions
    || campaignPermissions.accessInstructionMessages) {
    menuItems.push({
      key: 'messages',
      icon: <MessageOutlined />,
      label: I18n.t('admin.threesixty_campaigns_menu_messages_title'),
    })
  }
  campaignPermissions.editReportOptions && menuItems.push({
    key: 'reports',
    icon: <PieChartOutlined />,
    label: I18n.t('admin.threesixty_campaigns_menu_report_title'),
  })
  campaignPermissions.viewDatasheets && menuItems.push({
    key: 'datasheet',
    icon: <DatabaseOutlined />,
    label: I18n.t('admin.threesixty_campaigns_menu_datasheet_title'),
  })

  campaignPermissions.viewAIArtifacts && menuItems.push({
    key: 'ai_artifacts',
    icon: <RobotOutlined />,
    label: I18n.t('admin.ai_artifacts'),
  })

  campaignPermissions.manageAdmins && menuItems.push({
    key: 'admins',
    label: I18n.t('admin.admins'),
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
