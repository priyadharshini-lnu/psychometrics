import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { Menu } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  FormOutlined,
} from '@ant-design/icons'

import { get as getCurrentUser } from 'core/currentUser'
import {
  getCurrentAssessmentId, getCampaignReportPermissions,
} from 'modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

import routeUtils from 'utils/route'
import settings from '../settings'

const connector = connect(
  state => ({
    currentUser: getCurrentUser(state),
    assessmentId: getCurrentAssessmentId(state),
    campaignReportPermissions: getCampaignReportPermissions(state),
  }),
  {},
)

const { I18n } = window

const MyMenu = ({
  currentUser,
  assessmentId,
  campaignReportPermissions,
}) => {
  const history = useHistory()
  const { pathname } = useLocation()

  const getActiveMenuKey = (pathname) => {
    if (pathname.includes('/participants')) {
      return ['participants']
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

  const handleMenuSelect = ({ key }) => {
    if (key === 'assessment_builder') {
      window.location.pathname = `/administration/assessments/${assessmentId}`
    } else {
      routeUtils.moveTo(history, settings.urlPrefix, `/${key}`)
    }
  }

  return (
    <Menu
      className="mb-3"
      onSelect={handleMenuSelect}
      selectedKeys={getActiveMenuKey(pathname)}
      mode="horizontal"
    >
      <Menu.Item key="participants">
        <UserOutlined />
        {I18n.t('administration.threesixty_campaigns.menu.participants.title')}
      </Menu.Item>
      {currentUser.permissions.manageMessages && (
        <Menu.Item key="messages/options">
          <MailOutlined />
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
      {campaignReportPermissions.editAssessment && (
      <Menu.Item key="assessment_builder">
        <FormOutlined />
        {I18n.t('administration.threesixty_campaigns.menu.assessment.title')}
      </Menu.Item>
      )}
    </Menu>
  )
}

export default connector(MyMenu)
