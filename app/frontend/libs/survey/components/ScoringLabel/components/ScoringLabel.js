import React from 'react'
import styles from './ScoringLabel.scss'

const ScoringLabel = ({ value, label, onToggle }) => (
  <div
    onClick={onToggle}
    className={`${styles.container} ${value ? styles.fill : styles.empty}`}
  >
    {label}
  </div>
)

export default ScoringLabel
