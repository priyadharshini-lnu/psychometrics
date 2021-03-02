
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { get as getUserReports } from 'modules/admin/modules/AssessorApp/core/userReports'
import {
  Table, Row, Col, Dropdown, Menu,
} from 'antd'
import { Link, useParams } from 'react-router-dom'
import { MoreOutlined } from '@ant-design/icons'
import { RootState } from 'modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    userReports: getUserReports(state).list,
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { Column } = Table
const { I18n } = window

const UserReports: React.FC<Props> = ({ userReports }) => {
  const { campaignId } = useParams<{campaignId: string}>()
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <Row>
      <Col span={24}>
        <Table className="mtm mbl" rowKey="id" dataSource={userReports} pagination={false}>
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="id"
            key="id"
          />
          <Column
            title={I18n.t('campaign_report.column.report_name')}
            key="name"
            dataIndex="name"
          />
          <Column
            title={I18n.t('common.column.status')}
            key="status"
            render={({ status }) => I18n.t(`user_reports.statuses.${status}`)}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={({ id, internal, reportUrl }) => (
              <Dropdown
                overlay={() => (
                  ActionsMenu({
                    campaignId: parsedCampaignId, id, internal, reportUrl,
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
  id: number
  internal: boolean
  reportUrl: string
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, id, internal, reportUrl,
}) => {
  const viewReportMenu = () => {
    if (!internal && !reportUrl) return null

    if (!internal && reportUrl) {
      return (
        <Menu.Item key="downloadReport">
          <a href={reportUrl} target="_blank" rel="noopener noreferrer">{I18n.t('reports.actions.download')}</a>
        </Menu.Item>
      )
    }

    return (
      <Menu.Item key="viewReport">
        <Link to={`/assessors/campaigns/${campaignId}/user_reports/${id}/`}>
          {I18n.t('reports.actions.view')}
        </Link>
      </Menu.Item>
    )
  }

  return (
    <Menu>
      {viewReportMenu()}
      {internal && (
        <Menu.Item key="downloadReport">
          <a
            href={internal
              ? `/assessors/campaigns/${campaignId}/user_reports/${id}/download.pdf`
              : reportUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {I18n.t('reports.actions.download')}
          </a>
        </Menu.Item>
      )}
    </Menu>
  )
}

export default connecter(UserReports)
