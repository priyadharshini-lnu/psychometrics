import React from 'react'
import css from './Options.scss'

export default function OptionSection ({ label, children }) {
  return (
    <div className={css.optionSectionContainer}>
      <div className={css.optionLabel}>{label}</div>
      <div className={css.optionChildrenContainer}>{children}</div>
    </div>
  )
}
