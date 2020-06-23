import React from 'react'
import styles from './styles.scss'
import SubjectConditions from './SubjectConditions'
import Conditions from './Conditions'

export default function ConditionsContainer () {
  return (
    <div className={styles.tabsContent}>
      <div>
        <div className={styles.conditionTitle}>Subject Conditions</div>
        <div className={styles.conditionsContainer}>
          <SubjectConditions />
        </div>
      </div>
      <div>
        <div className={styles.conditionTitle}>Nomination Requirements</div>
        <div className={styles.conditionsContainer}>
          <Conditions />
        </div>
      </div>
    </div>
  )
}
