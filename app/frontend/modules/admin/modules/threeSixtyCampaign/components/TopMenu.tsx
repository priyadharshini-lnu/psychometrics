import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import {
  UserOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  MessageOutlined,
  FormOutlined,
} from '@ant-design/icons'

import { get as getCurrentUser } from 'core/currentUser'
import {
  getCurrentAssessmentId, getAssessmentPermissions,
} from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { RootState } from 'modules/admin/core/rootReducers'

import routeUtils from 'utils/route'
import settings from '../settings'

const { I18n } = window

const connector = connect((state: RootState) => ({
  currentUser: getCurrentUser(state),
  assessmentId: getCurrentAssessmentId(state),
  assessmentPermissions: getAssessmentPermissions(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

const TopMenuComponent: FC<PropsFromRedux> = ({
  currentUser,
  assessmentId,
  assessmentPermissions,
}) => {
  const { pathname } = useLocation()

  const history = useHistory()

  const handleOnSelect = ({ key }) => {
    if (key === 'assessment_builder') {
      window.location.pathname = `/administration/assessments/${assessmentId}`
    } else {
      const basePath = routeUtils.getBasePath(settings.urlPrefix)
      history.push(`${basePath}/${key}`)
    }
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
      <Menu.Item key="participants">
        <UserOutlined />
        {I18n.t('administration.threesixty_campaigns.menu.participants.title')}
      </Menu.Item>
      {/* <Menu.Item key="admins">
        <SolutionOutlined />
        {I18n.t('common.model.admins')}
      </Menu.Item> */}
      {currentUser.permissions.manageMessages && (
        <Menu.Item key="messages/options">
          <MessageOutlined />
          {I18n.t('administration.threesixty_campaigns.menu.messages.title')}
        </Menu.Item>
      )}
      <Menu.Item key="reports/options">
        <PieChartOutlined />
        {I18n.t('administration.threesixty_campaigns.menu.report.title')}
      </Menu.Item>
      <Menu.Item key="datasheets">
        <DatabaseOutlined />
        {I18n.t('administration.threesixty_campaigns.menu.datasheet.title')}
      </Menu.Item>
      {assessmentPermissions?.editAssessment && (
      <Menu.Item key="assessment_builder">
        <FormOutlined />
        {I18n.t('administration.threesixty_campaigns.menu.assessment.title')}
      </Menu.Item>
      )}
    </Menu>
  )
}

export const TopMenu = connector(TopMenuComponent)
