/* eslint-disable max-len */

import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { PageHeader } from '@ant-design/pro-layout'
import {
  Table, Row, Col, Button,
  Space,
} from 'antd'
import { useParams } from 'react-router-dom'
import { getCurrent, fetchSingle } from '~/modules/admin/modules/AssessorApp/core/users'
import { get as getUserAssessments } from '~/modules/admin/modules/AssessorApp/core/userAssessments'
import { RootState } from '~/modules/admin/core/rootReducers'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import ReportList from './ReportList'
import styles from './styles.less'

const connecter = connect(
  (state: RootState) => ({
    user: getCurrent(state),
    userAssessments: getUserAssessments(state),
  }),
  {
    fetchSingle,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { Column } = Table
const { I18n } = window

const UserDetails: React.FC<Props> = (
  {
    user,
    userAssessments,
    fetchSingle,
  },
) => {
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  let parsedCampaignId; let
    parsedUserId: null | number = null
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }

  useEffect(() => {
    if (parsedCampaignId && parsedUserId) { fetchSingle(parsedCampaignId, parsedUserId) }
  }, [])

  if (!parsedCampaignId || !user) { return null }

  return (
    <>
      <Breadcrumb
        request={{
          fields: ['project', 'campaign', 'client'],
          data: { campaignId: parsedCampaignId },
        }}
        crumbs={[{
          link: () => '/assessors',
          label: () => I18n.t('common.model.campaigns'),
        }, {
          label: state => state.campaign.name,
          link: () => `/assessors/campaigns/${campaignId}/users`,
        },
        {
          label: () => user?.email,
        },
        ]}
      />
      <PageHeader
        ghost={false}
        title={<h1 className="fs-32 mt-0 mb-0">{user.fullName}</h1>}
        subTitle={user.email}
      />
      <div className="pl">
        <Row justify="space-between" align="middle">
          <Col><h2 className="fs-24">{I18n.t('common.model.assessments')}</h2></Col>
          <Col>
            <Space>
              <Button
                className={styles['assessment-buttons']}
                href={`/assessors/campaigns/${campaignId}/evaluations/${user.id}${status === 'completed' ? '?edit=true' : ''}`}
                type="primary"
              >
                {status === 'completed'
                  ? I18n.t('assessments.actions.reevaluate')
                  : I18n.t('assessments.actions.evaluate') }
              </Button>
              {user.assessorCanModerateScores
                && (
                  <Button
                    className={styles['assessment-buttons']}
                    href={`/assessors/campaigns/${campaignId}/moderate_scoring/${user.id}`}
                    type="primary"
                  >
                    {I18n.t('assessments.actions.moderate')}
                  </Button>
                )
              }
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table className="mtm mbl" rowKey="id" dataSource={userAssessments} pagination={false}>
              <Column
                title={I18n.t('common.column.id')}
                dataIndex="id"
                key="id"
              />
              <Column
                title={I18n.t('campaign_assessment.column.assessment_name')}
                key="assessmentName"
                dataIndex="assessmentName"
              />
              <Column
                title={I18n.t('common.column.responses_count')}
                key="responsesCount"
                dataIndex="responsesCount"
              />
              <Column
                title={I18n.t('common.column.status')}
                key="status"
                render={({ status }) => I18n.t(`campaign_assessment.statuses.${status}`)}
              />
            </Table>
          </Col>
        </Row>
      </div>
      <div className="pl">
        <h2 className="fs-24">{I18n.t('common.model.reports')}</h2>
        <ReportList />
      </div>
    </>
  )
}

export default connecter(UserDetails)
