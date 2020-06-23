import React from 'react'
import styles from './styles.scss'

export default function Section ({ label, children }) {
  return (
    <div className={styles.sectionContainer}>
      <div className={styles.label}>{label}</div>
      <div className={styles.childrenContainer}>{children}</div>
    </div>
  )
}
