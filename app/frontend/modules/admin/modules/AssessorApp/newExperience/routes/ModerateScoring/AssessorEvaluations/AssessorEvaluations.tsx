import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Tabs, Alert, Flex } from '@thetalententerprise/glint'
import store from '~/modules/admin/store'
import { setStore, getStore } from '~/modules/survey/store/StoreWatchman'
import { RootState } from '~/modules/admin/core/rootReducers'
import AssessorAssessment from './AssessorAssessment'
import styles from './styles.less'

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

  const tabItems = assessorAssessments.map(assessment => ({
    key: `${assessment.id}`,
    label: assessment.name,
    children: <AssessorAssessment assessmentId={+assessment.assessment_id} />,
  }))

  return (
    <Flex className="h-100" vertical>
      {header(I18n.t('admin.assessor_evaluations'))}
      <div className={styles.evaluations}>
        {assessorAssessments.length > 0
          ? (
            <Tabs
              className="ps-6 pe-6"
              destroyOnHidden
              defaultActiveKey="1"
              items={tabItems}
            />
          ) : (
            <Alert type="warning" title={I18n.t('admin.no_completed_assessments')} />
          )}
      </div>
    </Flex>

  )
}

export default connector(AssessorEvaluations)
