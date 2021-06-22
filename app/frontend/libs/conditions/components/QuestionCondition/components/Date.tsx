import _ from 'lodash'
import React, { FC, ChangeEvent } from 'react'
import styles from './QuestionCondition.scss'
import { Condition } from './interfaces'

const PREDICATE = {
  EqualTo: 'Equal To',
  NotEqualTo: 'Not Equal To',
  Empty: 'Empty',
  NotEmpty: 'Not Empty',
  Displayed: 'Displayed',
  NotDisplayed: 'Not Displayed',
  NotInPast: 'Not in Past',
  NotInFuture: 'Not in Future',
}

type Props = {
  preview: boolean
  condition: Condition
  onChange: (condition: Condition) => {}
}

export const Date: FC<Props> = ({ preview, condition, onChange }) => {
  const changeType = (e: ChangeEvent<HTMLSelectElement>) => {
    condition.predicate = e.currentTarget.value
    onChange(condition)
  }

  const renderSelect = () => {
    if (preview) {
      return <div>{condition.predicate}</div>
    }
    return (
      <select className="form-control" value={condition.predicate} onChange={changeType}>
        {!condition.predicate && <option />}
        {_.map(PREDICATE, (label, value) => (<option key={value} value={value}>{label}</option>))}
      </select>
    )
  }

  return (
    <div className={!preview ? styles.predicates : undefined}>
      {renderSelect()}
      <div className={styles.empty} />
    </div>
  )
}

export default Date
