import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import store from 'modules/admin/store'
import {
  Col, Row, Tabs, Table,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import AssessorAssessment from './AssessorAssessment'
import UserAssessment from './UserAssessment'
import { fetchAssessorAssessments, changeAssessorForm, changeSubjectAssessment } from '../../core/evaluation'

const { TabPane } = Tabs
const { I18n } = window

const connector = connect((state: RootState) => ({
  evaluation: state.assessors.evaluation,
  currentAssessmentId: state.assessors.evaluation.currentAssessmentId,
}), {
  fetchAll: fetchAssessorAssessments,
  changeForm: changeAssessorForm,
  changeSubjectAssessment,
})

const Evaluation = ({
  fetchAll, changeForm, changeSubjectAssessment, evaluation: { userInfo, assessorAssessments, subjectAssessments },
  currentAssessmentId,
}) => {
  let parsedCampaignId; let
    parsedUserId
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }

  useEffect(() => {
    fetchAll(parsedCampaignId, parsedUserId)
  }, [])

  const changeAssessorForm = (id) => {
    if (id === 'overview') {
      changeForm(null)
      return
    }
    changeForm(id)
  }

  const changeSubjectForm = (id) => {
    changeSubjectAssessment(id)
  }

  return (
    <div>
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
          label: () => userInfo.user?.email,
        },
        ]}
      />
      <Row>
        <Col span={subjectAssessments.length ? 12 : 24}>
          <Tabs defaultActiveKey="overview" onChange={changeAssessorForm}>
            <TabPane tab="Overview" key="overview">
              <div>
                {I18n.t('user.fields.first_name')}
                {': '}
                {userInfo.user && userInfo.user.firstName}
              </div>
              <div>
                {I18n.t('user.fields.last_name')}
                {': '}
                {userInfo.user && userInfo.user.lastName}
              </div>
              <div>
                <Table
                  columns={[{
                    title: I18n.t('user.datasheet.attribute'),
                    dataIndex: 'key',
                    key: 'key',
                  }, {
                    title: I18n.t('user.datasheet.value'),
                    dataIndex: 'value',
                    key: 'value',
                  }]}
                  dataSource={_.map(userInfo.datasheet, (v, k) => ({ key: k, value: v }))}
                  pagination={false}
                  rowKey={row => row.key}
                />
              </div>
            </TabPane>
            {assessorAssessments.map(assessment => (
              <TabPane tab={assessment.name} key={assessment.id}>
                <AssessorAssessment userAssessmentId={+assessment.id} store={store} />
              </TabPane>
            ))}
          </Tabs>
        </Col>
        <Col span={12}>
          {subjectAssessments.length > 0 && (
            <Tabs defaultActiveKey="1" onChange={changeSubjectForm}>
              {subjectAssessments.map(assessment => (
                <TabPane tab={assessment.name} key={assessment.id}>
                  {+currentAssessmentId === +assessment.id && <UserAssessment subjectAssessmentId={+assessment.id} />}
                </TabPane>
              ))}
            </Tabs>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default connector(Evaluation)
