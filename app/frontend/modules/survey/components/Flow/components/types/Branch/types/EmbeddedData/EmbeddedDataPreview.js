import React from 'react'
import styles from '../../Condition.scss'

const EmbeddedDataPreview = ({ condition }) => (
  <div className={styles.questionDock}>
    <span className={styles.highlight}>{condition.key || ''}</span>
    <span className={styles.mute}>Is</span>
    <span className={styles.highlight}>{condition.predicate}</span>
    <span className={styles.highlight}>{condition.value || ''}</span>
  </div>
)

export default EmbeddedDataPreview
