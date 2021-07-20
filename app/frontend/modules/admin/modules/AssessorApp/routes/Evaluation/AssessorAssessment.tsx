import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Layout, Card, Progress,
} from 'antd'
import AssessmentContainer from 'modules/survey/containers/AssessmentContainer'
import { getProgress } from 'core/preview/FlowProcessor/selectors'
import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'
import { useLocation } from 'react-router-dom'
import styles from './styles.scss'
import { fetchAssessorAssessment, getAssessorForm, getCurrentAssessorForm } from '../../core/evaluation'

const { Content } = Layout

const connecter = connect((state: RootState, props: {userAssessmentId: number}) => ({
  loaded: state.assessors.evaluation.loaded,
  currentAssessorFormId: getCurrentAssessorForm(state.assessors),
  assessorForm: getAssessorForm(state.assessors.evaluation, props.userAssessmentId),
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
}), {
  fetch: fetchAssessorAssessment,
})

interface Props extends ConnectedProps<typeof connecter> {
  userAssessmentId: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
}

const AssessorAssessment: React.FC<Props> = ({
  fetch,
  store,
  userAssessmentId,
  progress,
  assessorForm,
  currentAssessorFormId,
  preview: {
    enableProgress,
  },
}) => {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const edit = params.get('edit')
  const read = params.get('read')
  useEffect(() => {
    if (+currentAssessorFormId === userAssessmentId) {
      fetch(userAssessmentId, { edit: edit === 'true', read: read === 'true' })
    }
  }, [currentAssessorFormId])

  const bodyStyles = { padding: 0 }
  const loaded = !!assessorForm

  return (
    <Card
      key={userAssessmentId}
      loading={!loaded}
      title={_.get(assessorForm, ['assessment', 'name'], 'Loading...')}
      bordered={false}
      bodyStyle={bodyStyles}
      className={styles.card}
      extra={[
        enableProgress
          && (<Progress key="1" percent={progress} style={{ width: '200px' }} />),
      ]}
    >
      <Content className="fluid-container">
        {loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={false}
            type={read === 'true' ? 'view_results' : 'pass_assessment'}
            data={assessorForm.assessment}
            result={assessorForm.result}
            dashboardUrl={`/assessors/campaigns/${_.get(assessorForm, ['result', 'campaign_id'])}/users`}
            resultsUrl={`/assessors/evaluations/${userAssessmentId}/results/${_.get(assessorForm, ['result', 'id'])}`}
            rstore={store}
            showScoringOnEndPage
            showQuestionScoring
            forceUpdateStore
          />
        )}
      </Content>
    </Card>
  )
}

export default connecter(AssessorAssessment)
