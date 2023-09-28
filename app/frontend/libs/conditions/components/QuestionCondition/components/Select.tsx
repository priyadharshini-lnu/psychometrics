import _ from 'lodash'
import { FC, ChangeEvent } from 'react'
import styles from './QuestionCondition.less'
import { Condition, Field } from './interfaces'

const PREDICATE = {
  Selected: 'Selected',
  NotSelected: 'Not Selected',
  Displayed: 'Displayed',
  NotDisplayed: 'Not Displayed',
}

type Props = {
  preview: boolean
  condition: Condition
  onChange: (condition: Condition) => {}
  field: Field
}

export const Select: FC<Props> = ({
  preview, condition, onChange, field,
}) => {
  const changeType = (e: ChangeEvent<HTMLSelectElement>) => {
    condition.predicate = e.currentTarget.value
    onChange(condition)
  }

  const changeValue = (e: ChangeEvent<HTMLSelectElement>) => {
    condition.value = e.currentTarget.value
    onChange(condition)
  }

  const renderOptions = () => {
    if (preview) {
      return <div>{condition.predicate}</div>
    }

    return (
      <select className="form-control" value={condition.value} onChange={changeValue}>
        {!condition.predicate && <option />}
        {_.map(field.optionList, value => (<option key={value} value={value}>{value}</option>))}
      </select>
    )
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
      {renderOptions()}
      {renderSelect()}
      <div className={styles.empty} />
    </div>
  )
}

export default Select
