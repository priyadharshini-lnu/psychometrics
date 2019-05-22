import React from 'react'
import _ from 'lodash'
import Criteria from './Criteria'
import css from './style.scss'
import { Select } from 'antd'
import cs from 'classnames'

export default function AvailabilityRequirement({
  conditions,
  addAvailiblityCondition,
  removeAvailiblityCondition,
  updateAvailiblityCondition,
  addNewLogicSetCondition,
  moveConditionToNextLogicSet
}) {
  if (_.isEmpty(conditions)) {
    return (
      <div className={css.addLink} onClick={() => addNewLogicSetCondition()} role="button" tabIndex={0}>
        Add conditions
      </div>
    )
  } else {
    return conditions.map((sub_condition, parent_index) => (
      <div className="mbs" key={parent_index}>
        {conditions.length > 1 && (
          <Operator
            operator={sub_condition.operator}
            addNewLogicSetCondition={addNewLogicSetCondition}
            updateAvailiblityCondition={value => updateAvailiblityCondition(parent_index, null, 'operator', value)}
          />
        )}
        <div className="mlm">
          {sub_condition.conditions.map((condition, child_index) => (
            <div key={child_index}>
              <Criteria
                addAvailiblityCondition={() => addAvailiblityCondition(parent_index)}
                moveConditionToNextLogicSet={() => moveConditionToNextLogicSet(parent_index, child_index)}
                removeAvailiblityCondition={() => removeAvailiblityCondition(parent_index, child_index)}
                updateAvailiblityCondition={(field, value) =>
                  updateAvailiblityCondition(parent_index, child_index, field, value)
                }
                condition={condition}
              />
            </div>
          ))}
        </div>
      </div>
    ))
  }
}

function Operator({ operator, addNewLogicSetCondition, updateAvailiblityCondition }) {
  const handleOperatorChange = value => {
    if (value === 'new_logic_set') {
      addNewLogicSetCondition('and')
    } else {
      updateAvailiblityCondition(value)
    }
  }

  if (operator === 'if') {
    return <div className={cs([css.operator, 'mbm'])}>If</div>
  } else {
    return (
      <Select
        value={operator}
        className={cs([css.inputElement, css.operator, 'mbm', 'mtm'])}
        dropdownMatchSelectWidth={false}
        onChange={handleOperatorChange}
      >
        <Select.Option key="and">And If</Select.Option>
        <Select.Option key="or">Or If</Select.Option>
        <Select.Option key="new_logic_set">Add Anthore Logic Set</Select.Option>
      </Select>
    )
  }
}
