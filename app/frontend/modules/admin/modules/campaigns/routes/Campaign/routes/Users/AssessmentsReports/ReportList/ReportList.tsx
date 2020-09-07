import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, Switch, Modal, message,
} from 'antd'
import { MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
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
}

export type Props = RouteComponentProps & OwnProps & PropsFromRedux

const ReportList: React.FC<Props> = ({
  reports: {
    list,
  },
  selectRecords,
  match: { params: { campaignId, projectId } },
  remove,
  toggleUserAccess,
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedProjectId = parseInt(projectId, 10)

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
            title={I18n.t('common.column.status')}
            key="status"
            render={({ status }) => I18n.t(`user_reports.statuses.${status}`)}
          />
          <Column
            title={I18n.t('campaign_report.column.user_access')}
            key="userAccess"
            render={({ userAccess, id }) => (
              <Switch
                checked={userAccess}
                onChange={() => {
                  toggleUserAccess(parsedCampaignId, id, { userAccess: !userAccess })
                }}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={userReport => (
              <Dropdown
                overlay={() => (
                    ActionsMenu({
                      projectId: parsedProjectId,
                      campaignId: parsedCampaignId,
                      userReportId: userReport.id,
                      userReportName: userReport.name,
                      remove: () => remove(parsedCampaignId, userReport.id),
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
  projectId: number
  campaignId: number
  userReportId: number
  userReportName: string
  remove(): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, userReportId, projectId, userReportName, remove,
}) => {
  const handleDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('user_reports.modals.remove.content', { userReportName }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('user_reports.modals.remove.successfully', { userReportName }))
      },
    })
  }

  return (
    <Menu>
      <Menu.Item key="viewReport">
        <Link to={`/administration/projects/${projectId}/new_campaigns/${campaignId}/user_reports/${userReportId}`}>
          {I18n.t('reports.actions.view')}
        </Link>
      </Menu.Item>
      <Menu.Item key="downloadReport">
        <a
          href={`/administration/new_campaigns/${campaignId}/user_reports/${userReportId}/download.pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('reports.actions.download')}
        </a>
      </Menu.Item>
      <Menu.Item key="remove">
        <div
          role="button"
          tabIndex={-1}
          onClick={handleDelete}
        >
          {I18n.t('common.actions.remove')}
        </div>
      </Menu.Item>
    </Menu>
  )
}

export default withRouter(ReportList)
