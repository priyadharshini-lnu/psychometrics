import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  connect, ConnectedProps, Provider,
} from 'react-redux'
import { useParams } from 'react-router-dom'
import { Layout, Card, Select } from '@thetalententerprise/glint'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import createAssessmentStore from '~/modules/admin/store/assessmentStore'
import { RootState } from '~/modules/admin/core/rootReducers'
import { fetchAssessorAssessment, getAssessorForm, getAssessorResults } from
  '~/modules/admin/modules/AssessorApp/core/scoreModerate'

const { Content } = Layout

const connecter = connect((state: RootState, props: {assessmentId: number}) => ({
  assessorForm: getAssessorForm(state.assessors.scoreModerate, props.assessmentId),
  assessorResults: getAssessorResults(state.assessors.scoreModerate, props.assessmentId),
}), {
  fetch: fetchAssessorAssessment,
})

interface Props extends ConnectedProps<typeof connecter> {
  assessmentId: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
}

const AssessmentProvider = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [store]: any = useState(createAssessmentStore())

  return (
    <Provider store={store}>
      <UserAssessment store={store} {...props} />
    </Provider>
  )
}

const UserAssessment: React.FC<Props> = ({
  assessmentId,
  assessorForm,
  assessorResults,
  fetch,
  store,
}) => {
  let parsedCampaignId
  let parsedUserId

  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }
  const [resultId, setResultId] = useState(null)

  useEffect(() => {
    if (!assessorForm) {
      fetch(parsedCampaignId, parsedUserId, assessmentId)
    }
  }, [])

  useEffect(() => {
    assessorResults && setResultId(assessorResults[0].id)
  }, [assessorResults])

  const loaded = !!assessorForm
  const bodyStyles = { padding: 0 }

  return (
    <Card
      loading={!loaded}
      title={(
        loaded && (
          <Select
            value={resultId}
            onChange={value => setResultId(value)}
            options={assessorResults.map(result => ({
              value: result.id,
              label: `${result.user.first_name} ${result.user.last_name}`,
            }))}
          />
        )
      )}
      variant="borderless"
      styles={{ body: bodyStyles }}
    >
      <Content className="fluid-container">
        {loaded && resultId && (
          <AssessmentContainer
            key={resultId}
            id="view_results"
            initialized={false}
            type="view_results"
            data={assessorForm}
            result={_.find(assessorResults, { id: resultId })}
            resultsUrl="/"
            rstore={store}
            showAsSinglePage
          />
        )}
      </Content>
    </Card>
  )
}

export default connecter(AssessmentProvider)
