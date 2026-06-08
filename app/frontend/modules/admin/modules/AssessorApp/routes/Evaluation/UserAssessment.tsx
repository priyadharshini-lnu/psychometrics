import React, { useEffect, useState } from 'react'
import {
  connect, ConnectedProps, Provider,
} from 'react-redux'
import { Layout, Card } from 'antd'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import createAssessmentStore from '~/modules/admin/store/assessmentStore'
import { RootState } from '~/modules/admin/core/rootReducers'
import styles from './styles.less'
import { fetchSubjectAssessment, getSubjectForm } from '../../core/evaluation'

const { I18n } = window
const { Content } = Layout

const connecter = connect((state: RootState, props: {subjectAssessmentId: number}) => ({
  subjectForm: getSubjectForm(state.assessors.evaluation, props.subjectAssessmentId),
}), {
  fetch: fetchSubjectAssessment,
})

interface Props extends ConnectedProps<typeof connecter> {
  subjectAssessmentId: number
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
  subjectForm,
  subjectAssessmentId,
  fetch,
  store,
}) => {
  useEffect(() => {
    if (!subjectForm) {
      fetch(subjectAssessmentId)
    }
  }, [])

  const loaded = !!subjectForm
  const bodyStyles = { padding: 0 }

  return (
    <Card
      loading={!loaded}
      title={_.get(subjectForm, ['assessment', 'name'], 'Loading...')}
      variant="borderless"
      styles={{ body: bodyStyles }}
      className={styles.card}
      extra={loaded && (
        <div>
          <div><b>{`${subjectForm.result.user.first_name} ${subjectForm.result.user.last_name}`}</b></div>
          {_.get(subjectForm.result, 'completed_at') && (
            <div>
              {I18n.t('admin.assessor_completed_at')}
              {': '}
              <b>{dayjs(subjectForm.result.completed_at).format('DD MMM YYYY')}</b>
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
          />
        )}
      </Content>
    </Card>
  )
}

export default connecter(AssessmentProvider)
