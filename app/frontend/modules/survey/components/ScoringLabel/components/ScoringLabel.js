import React from 'react'
import Utils from 'utils'
import styles from './ScoringLabel.scss'

const ScoringLabel = ({ value, label, onToggle }) => (
  <div
    onClick={onToggle}
    className={`${styles.container} ${Utils.isNumeric(value) ? styles.fill : styles.empty}`}
  >
    {label}
  </div>
)

export default ScoringLabel
