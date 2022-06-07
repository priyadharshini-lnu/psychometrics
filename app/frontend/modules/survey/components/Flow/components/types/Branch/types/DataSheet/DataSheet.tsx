import React from 'react'
import useUpdate from 'hooks/useUpdate'
import styles from './styles.less'
import conditionStyles from '../../Condition.less'

const PREDICATE_OPTIONS = [
  { value: 'EqualTo', label: 'Equal To' },
  { value: 'NotEqualTo', label: 'Not Equal To' },
  { value: 'GreaterThen', label: 'Greater Then' },
  { value: 'GreaterThenOrEqual', label: 'Greater Then Or Equal To' },
  { value: 'LessThen', label: 'Less Then' },
  { value: 'LessThenOrEqual', label: 'Less Then Or Equal To' },
  { value: 'Contains', label: 'Contains' },
  { value: 'DoesNotContains', label: 'Does Not Contains' },
  { value: 'MatchesRegexp', label: 'Matches Regexp' },
]

interface Props {
  condition: {
    field: string
    predicate: string
    value: string
  }
  dataSheetColumns: [{name: string}]
}

const DataSheet: React.FC<Props> = ({ condition, dataSheetColumns }) => {
  const forceUpdate = useUpdate()

  const changePredicate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    condition.predicate = e.currentTarget.value
    forceUpdate()
  }

  const changeField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    condition.field = e.currentTarget.value
    condition.value = ''
    forceUpdate()
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    condition.value = e.currentTarget.value
    forceUpdate()
  }

  return (
    <div className={conditionStyles.questionDock}>
      <select
        value={condition.field}
        className={`form-control ${styles.keySelect}`}
        onChange={changeField}
      >
        <option key="none">Select</option>
        {dataSheetColumns.map(({ name }) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      {condition.field && (
      <select
        value={condition.predicate}
        className={`form-control ${styles.predicateSelect}`}
        onChange={changePredicate}
      >
        {PREDICATE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      )}
      {condition.field && (
      <input
        className={`form-control ${styles.valueInput}`}
        value={condition.value}
        onChange={changeValue}
      />
      )}
    </div>
  )
}

export default DataSheet
