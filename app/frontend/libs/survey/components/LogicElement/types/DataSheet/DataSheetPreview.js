import React from 'react'
import styles from './DataSheet.scss'

const PREDICATE = {
  IsSameAsSubject: 'Is Same as Subject',
  EqualTo: 'Equal To',
  NotEqualTo: 'Not Equal To',
  GreaterThen: 'Greater Then',
  GreaterThenOrEqual: 'Greater Then Or Equal To',
  LessThen: 'Less Then',
  LessThenOrEqual: 'Less Then Or Equal To',
}

const EmbeddedDataPreview = ({ condition }) => (
  <div className={styles.datasheet}>
    <span className={styles.highlight}>{condition.subject || ''}</span>
    <span className={styles.mute}>Is</span>
    <span className={styles.highlight}>{PREDICATE[condition.predicate]}</span>
    <span className={styles.highlight}>{condition.value || ''}</span>
  </div>
)

export default EmbeddedDataPreview
