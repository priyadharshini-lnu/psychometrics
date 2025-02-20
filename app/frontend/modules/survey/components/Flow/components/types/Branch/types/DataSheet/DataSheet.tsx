import React from 'react'
import styles from './styles.less'
import conditionStyles from '../../Condition.less'

const PREDICATE_OPTIONS = [
  { value: 'EqualTo', label: 'Equal To' },
  { value: 'NotEqualTo', label: 'Not Equal To' },
  { value: 'GreaterThen', label: 'Greater Than' },
  { value: 'GreaterThenOrEqual', label: 'Greater Than Or Equal To' },
  { value: 'LessThen', label: 'Less Than' },
  { value: 'LessThenOrEqual', label: 'Less Than Or Equal To' },
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
  onUpdate: (model) => void
  index: number
  model: {props: {conditions: []}}
}

const DataSheet: React.FC<Props> = ({
  condition, dataSheetColumns, model, onUpdate, index,
}) => {
  const update = () => {
    const conditions = model.props.conditions.map((c, i) => (i === index ? condition : c))
    onUpdate({ ...model, props: { ...model.props, conditions } })
  }

  const changePredicate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    condition.predicate = e.currentTarget.value
    update()
  }

  const changeField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    condition.field = e.currentTarget.value
    condition.value = ''
    update()
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    condition.value = e.currentTarget.value
    update()
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
