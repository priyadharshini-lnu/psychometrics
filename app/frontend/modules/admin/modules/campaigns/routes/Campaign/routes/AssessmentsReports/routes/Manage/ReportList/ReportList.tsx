import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, Switch, message,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
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
  },
  match: { params: { projectId, campaignId } },
  openModal,
  selectRecords,
  toggleAssessorAccess,
  exportData,
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
                onChange={() => toggleAssessorAccess(parsedCampaignId, id)}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={report => (
              <Dropdown
                overlay={() => (
                    ActionsMenu({
                      projectId,
                      campaignId: parsedCampaignId,
                      campaignReportId: report.id,
                      reportId: report.reportId,
                      openModal,
                      exportData: handleExportData,
                    }) as React.ReactElement
                )}
                trigger={['click']}
              >
                <a>
                  <MoreOutlined />
                </a>
              </Dropdown>
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
  reportId: number
  campaignReportId: number
  openModal(name: string, data?: { campaignId: number, campaignReportId: number }): void
  exportData(campaignId: number, reportId: number): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, reportId, campaignReportId, openModal, exportData,
}) => (
  <Menu>
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
    <Menu.Item key="delete">
      <div
        role="button"
        tabIndex={-1}
        onClick={() => openModal('RemoveReportModal', { campaignId, campaignReportId })}
      >
        {I18n.t('common.actions.remove')}
      </div>
    </Menu.Item>
  </Menu>
)

export default withRouter(ReportList)
