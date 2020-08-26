import React from 'react'
import Assessment from '../Assessment'
import { PropsFromRedux } from './connect'
import styles from './styles.scss'

const { I18n } = window

const UngroupedList: React.FC<PropsFromRedux> = ({ assessments }) => (
  <div className={styles.container}>
    <div className={styles.title}>{I18n.t('assessments_reports.sequencing.ungrouped_assessments')}</div>
    <div className="mt24">
      {assessments.length
        ? assessments.map(assessment => <Assessment key={assessment.id} assessment={assessment} />)
        : (
          <div className={styles.noneFound}>
            <span className={styles.noneFoundIcon} />
            <span className={styles.noneFoundDesc}>
              {I18n.t('assessments_reports.sequencing.no_ungrouped_assessments')}
            </span>
          </div>
        )}
    </div>
  </div>
)

export default UngroupedList
