/* eslint-disable max-len */

import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Row, Col, Button,
  Space, theme,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { getCurrent } from '~/modules/admin/modules/AssessorApp/core/users'
import {
  get as getUserAssessments, isEvaluationCompleted,
} from '~/modules/admin/modules/AssessorApp/core/userAssessments'
import { RootState } from '~/modules/admin/core/rootReducers'
import ReportList from './ReportList'
import { SectionTitle } from '~/modules/admin/components/TableTitle'
import styles from './styles.less'


const connecter = connect(
  (state: RootState) => ({
    user: getCurrent(state),
    userAssessments: getUserAssessments(state),
    evaluationCompleted: isEvaluationCompleted(state),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { Column } = Table
const { I18n } = window

const Assessments: React.FC<Props> = ({ user, userAssessments, evaluationCompleted }) => {
  const { campaignId } = useParams() as {campaignId: string}
  const navigate = useNavigate()
  const { token } = theme.useToken()

  return (
    <>
      <div>
        <Row justify="space-between" align="middle">
          <Col><SectionTitle>{I18n.t('common.model.assessments')}</SectionTitle></Col>
          <Col>
            <Space>
              <Button
                className={styles['assessment-buttons']}
                onClick={() => navigate(`/assessors/campaigns/${campaignId}/evaluations/${user?.id}${evaluationCompleted ? '?edit=true' : ''}`)}
                type="primary"
              >
                {evaluationCompleted
                  ? I18n.t('assessments.actions.reevaluate')
                  : I18n.t('assessments.actions.evaluate') }
              </Button>
              {user?.assessorCanModerateScores
                && (
                  <Button
                    className={styles['assessment-buttons']}
                    onClick={() => navigate(`/assessors/campaigns/${campaignId}/moderate_scoring/${user.id}`)}
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
      <div style={{ marginTop: token.margin }}>
        <SectionTitle>{I18n.t('common.model.reports')}</SectionTitle>
        <ReportList />
      </div>
    </>
  )
}

export default connecter(Assessments)
