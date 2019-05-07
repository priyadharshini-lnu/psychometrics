import React from 'react'
import css from './Options.scss'

export default function OptionSection ({ label, children }) {
  return (
    <div className={css.sectionContainer}>
      <div className={css.label}>{label}</div>
      <div className={css.childrenContainer}>{children}</div>
    </div>
  )
}
