import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, Switch,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { State as ReportState } from 'modules/admin/modules/campaigns/core/reports'
import { withRouter, RouteComponentProps } from 'react-router-dom'

const { Column } = Table
const { I18n } = window

interface Props {
  reports: ReportState
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
}

const ReportList: React.FC<RouteComponentProps & Props> = ({
  reports: {
    list,
  },
  match: { params: { campaignId } },
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
          rowSelection={{ type: 'checkbox' }}
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
            render={({ userAccess }) => (
              <Switch checked={userAccess} onChange={() => { }} />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={userReport => (
              <Dropdown
                overlay={() => (
                    ActionsMenu({
                      campaignId: parsedCampaignId,
                      userReportId: userReport.id,
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
  campaignId: number
  userReportId: number
}

const ActionsMenu: React.FC<ActionMenuProps> = () => (
  <Menu>
    <Menu.Item key="viewReport">
      <div
        role="button"
        tabIndex={-1}
      >
        {I18n.t('reports.actions.view')}
      </div>
    </Menu.Item>
    <Menu.Item key="downloadReport">
      <div
        role="button"
        tabIndex={-1}
      >
        {I18n.t('reports.actions.download')}
      </div>
    </Menu.Item>
    <Menu.Item key="remove">
      <div
        role="button"
        tabIndex={-1}
      >
        {I18n.t('common.actions.remove')}
      </div>
    </Menu.Item>
  </Menu>
)

export default withRouter(ReportList)
