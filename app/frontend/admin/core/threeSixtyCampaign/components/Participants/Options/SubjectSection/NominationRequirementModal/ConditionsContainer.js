import React from 'react'
import _ from 'lodash'
import css from './style'
import SubjectConditions from './SubjectConditions'
import Conditions from './conditions'

export default function ConditionsContainer () {
  return (
    <>
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
    </>
  )
}
