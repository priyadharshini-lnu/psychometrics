import React from 'react'
import Assessment from '../Assessment'
import { PropsFromRedux } from './connect'
import styles from './styles.scss'
import AssessmentsDropArea from '../AssessmentsDropArea'

const { I18n } = window

const UngroupedList: React.FC<PropsFromRedux> = ({ assessments }) => (
  <div className={styles.container}>
    <div className={styles.title}>{I18n.t('assessments_reports.sequencing.ungrouped_assessments')}</div>
    <div className="mt24">
      {assessments.length
        ? assessments.map(assessment => <Assessment key={assessment.id} assessment={assessment} />)
        : (
          <AssessmentsDropArea
            groupId={null}
            text={I18n.t('assessments_reports.sequencing.no_ungrouped_assessments')}
          />
        )
        }
    </div>
  </div>
)
export default UngroupedList
