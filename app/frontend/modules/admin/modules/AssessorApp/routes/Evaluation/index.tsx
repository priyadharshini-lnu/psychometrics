import { useEffect } from 'react'
import { connect } from 'react-redux'
import {
  Col, Row, Tabs,
} from 'antd'
import { useParams, useLocation, useHistory } from 'react-router-dom'
import _ from 'lodash'
import { RootState } from '~/modules/admin/core/rootReducers'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import store from '~/modules/admin/store'
import { setStore, getStore } from '~/modules/survey/store/StoreWatchman'
import styles from './styles.less'
import AssessorAssessment from './AssessorAssessment'
import UserAssessment from './UserAssessment'
import Overview from './Overview'
import { fetchAssessorAssessments, changeAssessorForm, changeSubjectAssessment } from '../../core/evaluation'

const { TabPane } = Tabs
const { I18n, x_navigation_minimize } = window

const connector = connect((state: RootState) => ({
  evaluation: state.assessors.evaluation,
  currentAssessmentId: state.assessors.evaluation.currentAssessmentId,
  currentAssessorFormId: state.assessors.evaluation.currentAssessorFormId,
}), {
  fetchAll: fetchAssessorAssessments,
  changeForm: changeAssessorForm,
  changeSubjectAssessment,
})

const Evaluation = ({
  fetchAll, changeForm, changeSubjectAssessment, evaluation: { userInfo, assessorAssessments, subjectAssessments },
  currentAssessmentId, currentAssessorFormId,
}) => {
  let parsedCampaignId; let
    parsedUserId
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }
  const location = useLocation()
  const history = useHistory()
  const params = new URLSearchParams(location.search)

  useEffect(() => {
    if (!getStore()) {
      setStore(store)
    }
    fetchAll(parsedCampaignId, parsedUserId)
    if (x_navigation_minimize) {
      x_navigation_minimize('close')
    }
  }, [])

  useEffect(() => {
    const tabId = params.get('tab')
    if (tabId) {
      changeForm(tabId)

      const assessorForm = _.find(assessorAssessments, { id: +tabId })
      if (assessorForm?.linked_assessment_id) {
        const userAssessment = _.find(subjectAssessments, { assessment_id: assessorForm.linked_assessment_id })
        if (userAssessment) {
          changeSubjectAssessment(`${userAssessment.id}`)
        }
      }
    }
  }, [assessorAssessments])

  const changeAssessorForm = (id) => {
    params.delete('read')
    params.delete('edit')
    if (id === 'overview') {
      params.delete('tab')
      history.replace(`${location.pathname}?${params.toString()}`)
      changeForm(null)
      return
    }
    params.set('tab', id)
    history.replace(`${location.pathname}?${params.toString()}`)
    changeForm(id)

    const assessorForm = _.find(assessorAssessments, { id: +id })
    if (assessorForm?.linked_assessment_id) {
      const userAssessment = _.find(subjectAssessments, { assessment_id: assessorForm.linked_assessment_id })
      if (userAssessment) {
        changeSubjectAssessment(`${userAssessment.id}`)
      }
    }
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
      <Row className={styles.container}>
        <Col span={subjectAssessments.length ? 12 : 24}>
          <Tabs
            activeKey={currentAssessorFormId || 'overview'}
            defaultActiveKey="overview"
            onChange={changeAssessorForm}
            className={styles.assessorTabs}
          >
            <TabPane tab="Overview" key="overview">
              <Overview userInfo={userInfo} />
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
            <Tabs activeKey={currentAssessmentId} onChange={changeSubjectForm} tabBarStyle={{ margin: 0 }}>
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
