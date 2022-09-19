import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  MessageOutlined,
} from '@ant-design/icons'

import { get as getCurrentUser } from 'core/currentUser'
import { RootState } from 'modules/admin/core/rootReducers'

import routeUtils from 'utils/route'
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

  const history = useHistory()

  const handleOnSelect = ({ key }) => {
    const basePath = routeUtils.getBasePath(settings.urlPrefix)
    history.push(`${basePath}/${key}`)
  }

  const getActiveMenuKey = (pathname: string): Array<string> | undefined => {
    if (pathname.includes('/participants')) {
      return ['participants']
    }
    if (pathname.includes('/admins')) {
      return ['admins']
    }
    if (pathname.includes('/messages/options')) {
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

  return (
    <Menu
      onSelect={handleOnSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      mode="horizontal"
    >
      <Menu.Item key="participants" icon={<UserOutlined />}>
        {I18n.t('administration.threesixty_campaigns.menu.participants.title')}
      </Menu.Item>
      {/* <Menu.Item key="admins">
        <SolutionOutlined />
        {I18n.t('common.model.admins')}
      </Menu.Item> */}
      {(currentUser.permissions.accessEmailMessages
        || currentUser.permissions.accessMessagesOptions
        || currentUser.permissions.accessInstructionMessages) && (
        <Menu.Item key="messages/options" icon={<MessageOutlined />}>
          {I18n.t('administration.threesixty_campaigns.menu.messages.title')}
        </Menu.Item>
      )}
      {currentUser.permissions.editReportOptions && (
        <Menu.Item key="reports/options" icon={<PieChartOutlined />}>
          {I18n.t('administration.threesixty_campaigns.menu.report.title')}
        </Menu.Item>
      )}
      <Menu.Item key="datasheets" icon={<DatabaseOutlined />}>
        {I18n.t('administration.threesixty_campaigns.menu.datasheet.title')}
      </Menu.Item>
    </Menu>
  )
}

export const TopMenu = connector(TopMenuComponent)
