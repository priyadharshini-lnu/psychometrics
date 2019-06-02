import React from 'react'
import css from './style.scss'
import SubjectConditions from './SubjectConditions'
import Conditions from './Conditions'

export default function ConditionsContainer () {
  return (
    <div>
      <div>
        <div className={css.conditionTitle}>Subject Conditions</div>
        <div className={css.conditionsContainer}>
          <SubjectConditions />
        </div>
      </div>
      <div>
        <div className={css.conditionTitle}>Nomination Requirements</div>
        <div className={css.conditionsContainer}>
          <Conditions />
        </div>
      </div>
    </div>
  )
}
