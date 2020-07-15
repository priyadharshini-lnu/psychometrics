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
  match: { params: { projectId, campaignId } },
}) => (
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
            <Switch checked={userAccess} onChange={() => {}} />
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
                    campaignId,
                    campaignReportId: report.id,
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

interface ActionMenuProps {
  projectId: string
  campaignId: string
  campaignReportId: string
}

const ActionsMenu: React.FC<ActionMenuProps> = () => (
  <Menu>
    <Menu.Item key="edit">
      <div
        role="button"
        tabIndex={-1}
      >
          Edit
      </div>
    </Menu.Item>
  </Menu>
)

export default withRouter(ReportList)
