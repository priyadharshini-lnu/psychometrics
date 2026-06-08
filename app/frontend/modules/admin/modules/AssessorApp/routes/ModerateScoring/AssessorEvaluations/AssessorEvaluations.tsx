import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Tabs, Alert } from 'antd'
import store from '~/modules/admin/store'
import { setStore, getStore } from '~/modules/survey/store/StoreWatchman'
import { RootState } from '~/modules/admin/core/rootReducers'
import AssessorAssessment from './AssessorAssessment'
import styles from './styles.less'

const { TabPane } = Tabs
const { I18n } = window

const connector = connect((state: RootState) => ({
  scoreModerate: state.assessors.scoreModerate,
}), {
})

interface Props extends ConnectedProps<typeof connector> {
  header: (title:string) => React.ReactNode
}

export const AssessorEvaluations: FC<Props> = ({
  scoreModerate: {
    assessorAssessments,
  },
  header,
}) => {
  useEffect(() => {
    if (!getStore()) {
      setStore(store)
    }
  }, [])

  return (
    <div className={styles.sidebar}>
      {header(I18n.t('admin.assessor_evaluations'))}
      <div className={styles.evaluations}>
        {assessorAssessments.length > 0
          ? (
            <Tabs tabBarStyle={{ padding: '0 12px' }} destroyOnHidden defaultActiveKey="1">
              {assessorAssessments.map(assessment => (
                <TabPane tab={assessment.name} key={assessment.id}>
                  <AssessorAssessment assessmentId={+assessment.assessment_id} />
                </TabPane>
              ))}
            </Tabs>
          ) : (
            <Alert type="warning" message={I18n.t('admin.no_completed_assessments')} />
          )}
      </div>
    </div>

  )
}

export default connector(AssessorEvaluations)
