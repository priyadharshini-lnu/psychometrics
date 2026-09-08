import React, { useEffect, useState } from 'react'
import {
  connect, ConnectedProps, Provider,
} from 'react-redux'
import { useParams } from 'react-router-dom'
import { Layout, Card } from 'antd'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import createAssessmentStore from '~/modules/admin/store/assessmentStore'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  fetchLeadAssessment, fetchAssessorAssessments, getLeadAssessorForm, getLeadAssessorResult,
  FetchLeadAssessmentsType,
} from '../../core/scoreModerate'
import { setStore, getStore } from '~/modules/survey/store/StoreWatchman'
import { sendMessage } from '~/utils/messageBus'

const { Content } = Layout

const connecter = connect((state: RootState) => ({
  loadedUserId: state.assessors.scoreModerate.userId,
  userAssessmentId: state.assessors.scoreModerate.leadAssessorUserAssessmentId,
  assessorForm: getLeadAssessorForm(state.assessors.scoreModerate),
  assessorResult: getLeadAssessorResult(state.assessors.scoreModerate),
}), {
  fetchLeadAssessment,
  fetchAssessorAssessments,
})

interface Props extends ConnectedProps<typeof connecter> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
  readOnly: boolean
}

const Evaluation = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [store]: any = useState(createAssessmentStore())

  return (
    <Provider store={store}>
      <LeadAssessorAssessment store={store} {...props} />
    </Provider>
  )
}

const LeadAssessorAssessment: React.FC<Props> = ({
  loadedUserId,
  userAssessmentId,
  assessorForm,
  assessorResult,
  fetchLeadAssessment,
  fetchAssessorAssessments,
  store,
  readOnly,
}) => {
  let parsedCampaignId
  let parsedUserId

  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }

  useEffect(() => {
    if (!getStore()) {
      setStore(store)
    }
    fetchLeadAssessment(parsedCampaignId, parsedUserId).then(({ response }) => {
      const { status } = (response as FetchLeadAssessmentsType).lead_assessor_result

      sendMessage('lead_assessor_assessment:status_change', status)
    })
    fetchAssessorAssessments(parsedCampaignId, parsedUserId)
  }, [parsedUserId])
  const loaded = !!assessorForm && loadedUserId === parsedUserId
  const bodyStyles = { padding: 0 }

  return (
    <Card
      loading={!loaded}
      variant="borderless"
      styles={{ body: bodyStyles }}
    >
      <Content className="fluid-container">
        {loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={false}
            type={readOnly ? 'view_results' : 'pass_assessment'}
            data={assessorForm}
            result={assessorResult}
            notAnEndPage={readOnly}
            resultsUrl={`/assessors/evaluations/${userAssessmentId}/results/${assessorResult.id}`}
            rstore={store}
            isAssessor
          />
        )}
      </Content>
    </Card>
  )
}

export default connecter(Evaluation)
