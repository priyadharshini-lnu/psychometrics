import React, { useEffect } from 'react'
import { connect, ConnectedProps, Provider } from 'react-redux'
import { Layout, Card } from 'antd'
import AssessmentContainer from 'modules/survey/containers/AssessmentContainer'
import { getProgress } from 'core/preview/FlowProcessor/selectors'
import _ from 'lodash'
import createAssessmentStore from 'modules/admin/store/assessmentStore'
import moment from 'moment'
import styles from './styles.scss'
import { fetchSubjectAssessment, getSubjectForm } from '../../core/evaluation'

const { I18n } = window
const { Content } = Layout

const mapStateToProps = (state, props) => ({
  subjectForm: getSubjectForm(state.assessors.evaluation, props.userAssessmentId),
  currentAssessmentId: state.assessors.evaluation.currentAssessmentId,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
})

const mapDispatchToProps = {
  fetch: fetchSubjectAssessment,
}

const connecter = connect(mapStateToProps, mapDispatchToProps)

interface Props extends ConnectedProps<typeof connecter> {
  subjectAssessmentId: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
}

const UserAssessment: React.FC<Props> = ({
  store,
  subjectForm,
  subjectAssessmentId,
  currentAssessmentId,
  fetch,
}) => {
  useEffect(() => {
    if (!subjectForm) {
      fetch(subjectAssessmentId)
    }
  }, [currentAssessmentId])

  const loaded = !!subjectForm
  const bodyStyles = { padding: 0, maxHeight: '100vh', overflowY: 'scroll' as 'scroll' }

  return (
    <Card
      loading={!loaded}
      title={_.get(subjectForm, ['assessment', 'name'], 'Loading...')}
      bordered={false}
      bodyStyle={bodyStyles}
      className={styles.card}
      extra={loaded && (
        <div>
          <div><b>{`${subjectForm.result.user.first_name} ${subjectForm.result.user.last_name}`}</b></div>
          {_.get(subjectForm.result, 'completed_at') && (
          <div>
            {I18n.t('administration.assessor.completed_at')}
            {': '}
            <b>{moment(subjectForm.result.completed_at).format('DD MMM YYYY')}</b>
          </div>
          )}
        </div>
      )}
    >
      <Content className="fluid-container">
        {loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={false}
            type="view_results"
            data={subjectForm.assessment}
            result={subjectForm.result}
            resultsUrl={`/user_assessments/${1}/users_results/${subjectForm.result.id}`}
            rstore={store}
            showAsSinglePage
            dontSaveStore
          />
        )}
      </Content>
    </Card>
  )
}

const withAssessmentProvider = (Component) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewStore: any = createAssessmentStore()

  return props => (
    <Provider store={previewStore}>
      <Component {...props} store={previewStore} />
    </Provider>
  )
}

export default withAssessmentProvider(connecter(UserAssessment))
