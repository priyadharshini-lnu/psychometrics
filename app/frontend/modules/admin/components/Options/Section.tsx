import React from 'react'
import styles from './styles.scss'

interface Props {
  label?: string
  children: React.ReactNode
}


const Section: React.FC<Props> = ({ label, children }) => (
  <div className={styles.sectionContainer}>
    {label && <div className={styles.label}>{label}</div>}
    <div className={styles.childrenContainer}>{children}</div>
  </div>
)

export default Section
