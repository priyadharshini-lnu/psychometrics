import React, { useEffect } from 'react'
import { connect, ConnectedProps, Provider } from 'react-redux'
import {
  Layout, Card,
} from 'antd'
import AssessmentContainer from 'modules/survey/containers/AssessmentContainer'
import { getProgress } from 'core/preview/FlowProcessor/selectors'
import _ from 'lodash'
import createAssessmentStore from 'modules/admin/store/assessmentStore'
import moment from 'moment'
import styles from './styles.scss'
import { fetchSubjectAssessment } from '../../core/evaluation'

const { I18n } = window
const { Content } = Layout

const mapStateToProps = state => ({
  loaded: state.assessors.evaluation.loaded,
  assessment: state.assessors.evaluation.assessment,
  result: state.assessors.evaluation.result,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
})

const mapDispatchToProps = {
  fetch: fetchSubjectAssessment,
}

const connecter = connect(mapStateToProps, mapDispatchToProps)

interface Props extends ConnectedProps<typeof connecter> {
  userAssessmentId: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
}

const UserAssessment: React.FC<Props> = ({
  store,
  loaded,
  userAssessmentId,
  assessment,
  result,
  preview: {
    initialized,
  },
  fetch,
}) => {
  useEffect(() => {
    fetch(userAssessmentId)
  }, [])

  const bodyStyles = { padding: 0, maxHeight: '100vh', overflowY: 'scroll' as 'scroll' }

  return (
    <Card
      loading={!loaded}
      title={_.get(assessment, 'name', '')}
      bordered={false}
      bodyStyle={bodyStyles}
      className={styles.card}
      extra={loaded && (
        <div>
          <div><b>{`${result.user.first_name} ${result.user.last_name}`}</b></div>
          {_.get(result, 'completed_at') && (
            <div>
              {I18n.t('administration.assessor.completed_at')}
              {': '}
              <b>{moment(result.completed_at).format('DD MMM YYYY')}</b>
            </div>
          )}
        </div>
      )}
    >
      <Content className="fluid-container">
        {loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={initialized}
            type="view_results"
            data={assessment}
            result={result}
            resultsUrl={`/user_assessments/${userAssessmentId}/users_results/${result.id}`}
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
