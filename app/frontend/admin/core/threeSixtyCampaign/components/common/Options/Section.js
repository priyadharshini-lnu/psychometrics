import React from 'react'
import css from './style.scss'

export default function Section ({ label, children }) {
  return (
    <div className={css.sectionContainer}>
      <div className={css.label}>{label}</div>
      <div className={css.childrenContainer}>{children}</div>
    </div>
  )
}
