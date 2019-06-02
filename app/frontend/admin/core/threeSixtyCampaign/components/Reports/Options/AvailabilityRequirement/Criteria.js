import React from 'react'
import { Input, Select, Icon } from 'antd'
import cs from 'classnames'
import css from './style.scss'
import NestedOperator from 'admin/core/threeSixtyCampaign/components/common/NestedOperator'

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
      <NestedOperator
        operator={operator}
        updateAvailiblityCondition={value => updateAvailiblityCondition('operator', value)}
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

