import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import store from 'modules/admin/store'
import { Col, Row } from 'antd'
import { useParams } from 'react-router-dom'
import Breadcrumbs from 'modules/admin/modules/campaigns/components/Breadcrumb'
import AssessorAssessment from './AssessorAssessment'
import UserAssessment from './UserAssessment'
import { fetchAssessorAssessment } from '../../core/evaluation'

const { I18n } = window

const mapStateToProps = state => ({
  result: state.assessors.evaluation.result,
  evaluation: state.assessors.evaluation,
})

const mapDispatchToProps = {
  fetch: fetchAssessorAssessment,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

const Evaluation = ({
  fetch, result, evaluation: { subject_user_assessment_id: subjectAssessmentId },
}) => {
  const { userAssessmentId } = useParams<{ userAssessmentId: string }>()
  useEffect(() => {
    fetch(parseInt(userAssessmentId, 10))
  }, [])

  if (!result) { return null }

  return (
    <div>
      <Breadcrumbs
        request={{
          fields: ['project', 'campaign', 'client'],
          data: { campaignId: result.campaign_id },
        }}
        crumbs={[{
          link: () => '/assessors',
          label: () => I18n.t('common.model.campaigns'),
        }, {
          label: state => state.campaign.name,
          link: () => `/assessors/campaigns/${result.campaign_id}/users`,
        },
        {
          label: () => result.user?.email,
          link: () => `/assessors/campaigns/${result.campaign_id}/users/${result.user.id}`,
        },
        ]}
      />
      <Row>
        <Col span={subjectAssessmentId ? 12 : 24}>
          <AssessorAssessment userAssessmentId={userAssessmentId} store={store} />
        </Col>
        <Col span={12}>
          {subjectAssessmentId && <UserAssessment userAssessmentId={userAssessmentId} /> }
        </Col>
      </Row>
    </div>
  )
}

export default connector(Evaluation)
