import React from 'react'
import { Input, Select, Icon } from 'antd'
import cs from 'classnames'
import css from './style.scss'

export default function Criteria ({
  condition: {
    operator, type, numberOfEvaluator, relationship,
  },
  relationships,
  addAvailiblityCondition,
  updateAvailiblityCondition,
  removeAvailiblityCondition,
  moveConditionToNextLogicSet,
}) {
  return (
    <div style={{ display: 'inline-block' }} className="mbs">
      <span className="mrs">from have been completed</span>
      <Operator
        operator={operator}
        updateAvailiblityCondition={value => updateAvailiblityCondition('operator', value)}
        removeAvailiblityCondition={removeAvailiblityCondition}
        moveConditionToNextLogicSet={moveConditionToNextLogicSet}
      />
      <Input
        value={numberOfEvaluator}
        size="small"
        className={cs([css.inputElement, css.width80])}
        onChange={(e) => {
          updateAvailiblityCondition('numberOfEvaluator', e.target.value)
        }}
      />
      <Select
        value={type}
        size="small"
        className={css.inputElement}
        dropdownMatchSelectWidth={false}
        onChange={value => updateAvailiblityCondition('type', value)}
      >
        <Select.Option key="evaluations">Evaluation(s)</Select.Option>
      </Select>
      <Select
        value={relationship}
        size="small"
        className={css.inputElement}
        dropdownMatchSelectWidth={false}
        onChange={value => updateAvailiblityCondition('relationship', value)}
      >
        {relationships.map(r => (<Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>))}
      </Select>
      <span>
        <Icon type="minus-circle" className={css.deleteIcon} onClick={removeAvailiblityCondition} />
        <Icon type="plus-circle" className={css.addIcon} onClick={addAvailiblityCondition} />
      </span>
    </div>
  )
}

function Operator ({
  operator, updateAvailiblityCondition, removeAvailiblityCondition, moveConditionToNextLogicSet,
}) {
  const handleOperatorChange = (value) => {
    if (value === 'move_to_new_logic_set') {
      moveConditionToNextLogicSet()
      removeAvailiblityCondition()
    } else {
      updateAvailiblityCondition(value)
    }
  }

  if (operator === 'if') return null
  return (
    <Select
      value={operator}
      size="small"
      dropdownMatchSelectWidth={false}
      className={cs([css.inputElement, css.width80])}
      onChange={handleOperatorChange}
    >
      <Select.Option key="and">And</Select.Option>
      <Select.Option key="or">Or</Select.Option>
      <Select.Option key="move_to_new_logic_set">Move to new logic set</Select.Option>
    </Select>
  )
}
