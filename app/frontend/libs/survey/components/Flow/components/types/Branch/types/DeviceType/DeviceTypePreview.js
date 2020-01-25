import React from 'react'
import styles from '../../Condition.scss'

const mapPredicates = {
  is: 'is',
  isNot: 'is not',
}

const DeviceTypePreview = ({ condition }) => (
  <div className={styles.questionDock}>
    <span className={styles.mute}>{mapPredicates[condition.predicate]}</span>
    <span className={styles.highlight}>{condition.value}</span>
  </div>
)

export default DeviceTypePreview
