
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Button, Dropdown, MenuProps, Tooltip,
} from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { Link, useParams } from 'react-router-dom'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { get as getUserReports } from '~/modules/admin/modules/AssessorApp/core/userReports'
import { FETCH_SINGLE } from '~/modules/admin/modules/AssessorApp/core/users'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    userReports: getUserReports(state).list,
    loading: isRequestInProgress(state, FETCH_SINGLE),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { Column } = Table
const { I18n } = window

const UserReports: React.FC<Props> = ({ userReports, loading }) => {
  const { campaignId } = useParams() as {campaignId: string}
  const parsedCampaignId = parseInt(campaignId, 10)
  const screens = useBreakpoint()

  return (
    <Row>
      <Col span={24}>
        <Table
          className="mtm mbl"
          rowKey="id"
          dataSource={userReports}
          loading={loading}
          scroll={{ x: 'max-content' }}
          sticky
          pagination={false}
        >
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="id"
            key="id"
            fixed={screens.md ? 'left' : undefined}
          />
          <Column
            title={I18n.t('campaign_report.column.report_name')}
            key="name"
            dataIndex="name"
            width={300}
            fixed={screens.md ? 'left' : undefined}
          />
          <Column
            title={I18n.t('common.column.status')}
            key="status"
            render={({ status, unavailabilityReasonDetails }) => {
              const statusLabel = I18n.t(`user_reports.statuses.${status}`)
              const reasonMessage = unavailabilityReasonDetails?.reasonMessage

              if (status !== 'not_prepared' || !reasonMessage) {
                return statusLabel
              }

              return (
                <Tooltip title={reasonMessage}>
                  <span>{statusLabel}</span>
                </Tooltip>
              )
            }}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={({ id, internal, reportUrl }) => (
              <Dropdown
                menu={
                  getActionsMenuProps({
                    campaignId: parsedCampaignId, id, internal, reportUrl,
                  })}
                trigger={['click']}
              >
                <Button type="link" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          />
        </Table>
      </Col>
    </Row>
  )
}

interface ActionMenuData {
  campaignId: number
  id: number
  internal: boolean
  reportUrl: string
}

const getActionsMenuProps = ({
  campaignId, id, internal, reportUrl,
}:ActionMenuData):MenuProps => {
  const previewUrl = () => {
    if (internal) {
      return `/assessors/campaigns/${campaignId}/user_reports/${id}/`
    }

    return `/assessors/campaigns/${campaignId}/external_user_report/${id}/`
  }

  return ({
    items: [{
      key: 'viewReport',
      label: (
        <Link to={previewUrl()}>
          {I18n.t('reports.actions.view')}
        </Link>),
      disabled: !(internal || reportUrl),
    }],
  })
}

export default connecter(UserReports)
