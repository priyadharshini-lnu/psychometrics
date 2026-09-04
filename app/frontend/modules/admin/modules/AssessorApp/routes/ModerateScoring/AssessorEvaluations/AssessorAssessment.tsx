import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import {
  connect, ConnectedProps, Provider,
} from 'react-redux'
import { useParams } from 'react-router-dom'
import { Layout, Card, Select } from 'antd'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import createAssessmentStore from '~/modules/admin/store/assessmentStore'
import { RootState } from '~/modules/admin/core/rootReducers'
import styles from './styles.less'
import { fetchAssessorAssessment, getAssessorForm, getAssessorResults } from '../../../core/scoreModerate'

const { Content } = Layout

const connecter = connect((state: RootState, props: {assessmentId: number}) => ({
  loadedUserId: state.assessors.scoreModerate.userId,
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
  loadedUserId,
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
    if (!assessorForm || loadedUserId !== parsedUserId) {
      fetch(parsedCampaignId, parsedUserId, assessmentId)
    }
  }, [parsedUserId])

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
          <Select value={resultId} onChange={value => setResultId(value)} className={styles.select}>
            {assessorResults.map(result => (
              <Select.Option value={result.id}>
                {result.user.first_name}
                {' '}
                {result.user.last_name}
              </Select.Option>
            ))}
          </Select>
        )
      )}
      variant="borderless"
      styles={{ body: bodyStyles }}
      className={styles.card}
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
