
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Dropdown, Menu,
} from 'antd'
import { Link, useParams } from 'react-router-dom'
import { MoreOutlined } from '@ant-design/icons'
import { get as getUserReports } from '~/modules/admin/modules/AssessorApp/core/userReports'
import { RootState } from '~/modules/admin/core/rootReducers'

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
  const previewUrl = () => {
    if (internal) {
      return `/assessors/campaigns/${campaignId}/user_reports/${id}/`
    }

    return `/assessors/campaigns/${campaignId}/external_user_report/${id}/`
  }

  return (
    <Menu
      items={
        [{
          key: 'viewReport',
          label: (
            <Link to={previewUrl()}>
              {I18n.t('reports.actions.view')}
            </Link>),
          disabled: !(internal || reportUrl),
        }]
      }
    />
  )
}

export default connecter(UserReports)
