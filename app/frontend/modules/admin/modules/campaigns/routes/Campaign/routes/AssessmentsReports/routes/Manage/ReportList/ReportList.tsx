import React from 'react'
import {
  Table, Menu, Row, Col, Switch,
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
  match: { params: { projectId, campaignId } },
  openModal,
  selectRecords,
  toggleAssessorAccess,
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)

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
            title={I18n.t('common.column.action')}
            key="action"
            render={report => (
              <ConditionalDropdown
                menu={
                  ActionsMenu({
                    projectId,
                    campaignId: parsedCampaignId,
                    campaignReportId: report.id,
                    reportId: report.reportId,
                    permissions: report.permissions,
                    openModal,
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
  projectId: string
  campaignId: number
  reportId: string
  campaignReportId: number
  openModal(name: string, data?: { campaignId: number, campaignReportId: number }): void
  permissions: {
    export: boolean
    remove: boolean
  }
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, reportId, campaignReportId, openModal, permissions,
}) => (
  <Menu>
    {permissions.export && (
      <Menu.Item key="export">
        <div
          role="button"
          tabIndex={-1}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/reports/${reportId}/export.xlsx`}
          >
            Export Data
          </a>
        </div>
      </Menu.Item>
    )}
    {permissions.remove && (
      <Menu.Item key="delete">
        <div
          role="button"
          tabIndex={-1}
          onClick={() => openModal('RemoveReportModal', { campaignId, campaignReportId })}
        >
          {I18n.t('common.actions.remove')}
        </div>
      </Menu.Item>
    )}
  </Menu>
)

export default withRouter(ReportList)
