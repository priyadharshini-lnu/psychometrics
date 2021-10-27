import React from 'react'
import { Menu } from 'antd'

import routeUtils from 'utils/route'
import RouteList from 'components/RouteList'

import settings from '../../settings'

export default function Reports ({
  history, routes, reportId, campaignReportPermissions,
}) {
  const onSelect = ({ key }) => {
    if (key === 'report_builder') {
      window.location.pathname = `/administration/reports/${reportId}`
    } else {
      routeUtils.moveTo(history, settings.urlPrefix, key)
    }
  }

  return (
    <div>
      <Menu onSelect={onSelect} selectedKeys={[routeUtils.getActiveRoutePath(routes)]} mode="horizontal">
        {campaignReportPermissions.editSubjectReport && (
          <Menu.Item key="report_builder">
            {I18n.t('administration.threesixty_campaigns.menu.report.menu.subject_report.title')}
          </Menu.Item>
        )}
        <Menu.Item key="/reports/options">
          {I18n.t('administration.threesixty_campaigns.menu.report.menu.report_options.title')}
        </Menu.Item>
      </Menu>
      <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
    </div>
  )
}
