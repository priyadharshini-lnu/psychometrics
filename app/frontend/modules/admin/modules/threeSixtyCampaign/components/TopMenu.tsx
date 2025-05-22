import { FC } from 'react'
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
import { get as getCurrentUser } from '~/core/currentUser'
import { RootState } from '~/modules/admin/core/rootReducers'

import routeUtils from '~/utils/route'
import settings from '../settings'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: getCurrentUser(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

const TopMenuComponent: FC<PropsFromRedux> = ({
  currentUser,
}) => {
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
      return ['messages/options']
    }
    if (pathname.includes('/reports/options')) {
      return ['reports/options']
    }
    if (pathname.includes('/datasheets')) {
      return ['datasheets']
    }
    return undefined
  }
  const menuItems: MenuItem[] = [{
    key: 'participants',
    icon: <UserOutlined />,
    label: I18n.t('administration.threesixty_campaigns.menu.participants.title'),
  }]
  if (currentUser.permissions.accessEmailMessages
    || currentUser.permissions.accessMessagesOptions
    || currentUser.permissions.accessInstructionMessages) {
    menuItems.push({
      key: 'messages/options',
      icon: <MessageOutlined />,
      label: I18n.t('administration.threesixty_campaigns.menu.messages.title'),
    })
  }
  currentUser.permissions.editReportOptions && menuItems.push({
    key: 'reports/options',
    icon: <PieChartOutlined />,
    label: I18n.t('administration.threesixty_campaigns.menu.report.title'),
  })
  menuItems.push({
    key: 'datasheets',
    icon: <DatabaseOutlined />,
    label: I18n.t('administration.threesixty_campaigns.menu.datasheet.title'),
  })

  currentUser.permissions.manageAdmins && menuItems.push({
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

export const TopMenu = connector(TopMenuComponent)
