import React from 'react'
import {
  Table, Menu, Row, Col, Switch, message,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { PropsFromRedux } from './connect'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  openModal(name: string, data?: { campaignId: number, campaignReportId: number }): void
}

type Props = RouteComponentProps & OwnProps & PropsFromRedux

const ReportList: React.FC<Props> = ({
  reports: {
    list,
    reportPermissions,
  },
  match: { params: { campaignId } },
  openModal,
  selectRecords,
  toggleAssessorAccess,
  exportData,
  toggleUserDashboard,
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)

  const handleExportData = (campaignId: number, reportId: number) => {
    exportData(campaignId, reportId).then(() => {
      message.success(I18n.t('campaign_report.messages.export_report_data_scheduled'))
    })
  }

  return (
    <Row>
      <Col span={24}>
        <Table
          className="mtm"
          rowKey="id"
          dataSource={list}
          pagination={false}
          rowSelection={{ type: 'checkbox', onChange: (ids: number[]) => { selectRecords(ids) } }}
        >
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="reportId"
            key="reportId"
          />
          <Column
            title={I18n.t('campaign_report.column.report_name')}
            key="name"
            dataIndex="name"
          />
          <Column
            title={I18n.t('campaign_report.column.report_bundle')}
            key="reportFamilyName"
            dataIndex="reportFamilyName"
          />
          <Column
            title={I18n.t('campaign_report.column.user_access')}
            key="userAccess"
            render={({ userAccess, id }) => (
              <Switch
                checked={userAccess}
                disabled={!reportPermissions.toggleUserAccess}
                onChange={() => openModal('ToggleUserAccessModal',
                  { campaignId, campaignReportId: id, userAccess })}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_report.column.assessor_access')}
            key="userAccess"
            render={({ assessorAccess, id }) => (
              <Switch
                checked={assessorAccess}
                disabled={!reportPermissions.toggleAssessorAccess}
                onChange={() => toggleAssessorAccess(parsedCampaignId, id)}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_report.column.user_dashboard')}
            key="userDashboard"
            render={({ userDashboard, id }) => (
              <Switch
                checked={userDashboard}
                disabled={!reportPermissions.toggleUserDashboard}
                onChange={() => toggleUserDashboard(parsedCampaignId, id)}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={report => (
              <ConditionalDropdown
                menu={
                  ActionsMenu({
                    campaignId: parsedCampaignId,
                    campaignReportId: report.id,
                    reportId: report.reportId,
                    reportName: report.name,
                    permissions: report.permissions,
                    openModal,
                    exportData: handleExportData,
                  }) as React.ReactElement
                }
                innerElement={(
                  <a>
                    <MoreOutlined />
                  </a>
                )}
              />
            )}
          />
        </Table>
      </Col>
    </Row>
  )
}

interface ActionMenuProps {
  campaignId: number
  reportId: number
  campaignReportId: number
  reportName: string
  openModal(name: string, data?: { campaignId: number, campaignReportId: number, reportName: string }): void
  permissions: {
    export: boolean
    remove: boolean
  }
  exportData(campaignId: number, reportId: number): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, reportId, campaignReportId, reportName, openModal, permissions, exportData,
}) => (
  <Menu>
    {permissions.export && (
      <Menu.Item key="export">
        <div
          role="button"
          tabIndex={-1}
        >
          <div
            role="button"
            tabIndex={-1}
            onClick={() => exportData(campaignId, reportId)}
          >
            {I18n.t('campaign_report.actions.export_data')}
          </div>
        </div>
      </Menu.Item>
    )}
    {permissions.remove && (
      <Menu.Item key="delete">
        <div
          role="button"
          tabIndex={-1}
          onClick={() => openModal('RemoveReportModal', { campaignId, campaignReportId, reportName })}
        >
          {I18n.t('common.actions.remove')}
        </div>
      </Menu.Item>
    )}
  </Menu>
)

export default withRouter(ReportList)
