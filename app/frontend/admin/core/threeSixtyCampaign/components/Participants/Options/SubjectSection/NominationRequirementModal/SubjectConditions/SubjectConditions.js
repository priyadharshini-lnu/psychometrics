import React from 'react'
import _ from 'lodash'
import cs from 'classnames'
import { Select } from 'antd'
import css from '../style.scss'
import Condition from './Condition'

export default function SubjectCondtions ({
  datasheetFields,
  subjectConditions,
  add,
  remove,
  update,
  addNewLogicalSetCondition,
  moveConditionToNextLogicSet,
}) {
  if (_.isEmpty(subjectConditions)) {
    return (
      <div>
        Every subject will have these nomination requirements.
        <span
          className={css.addSubjectConditionLink}
          onClick={() => addNewLogicalSetCondition({ field: datasheetFields[0] })}
          role="button"
          tabIndex={0}
        >
          Click to change
        </span>
      </div>
    )
  }
  return (
    subjectConditions.map((subCondition, parentIndex) => (
      <div className="mbs" key={parentIndex}>
        {subjectConditions.length > 1 && (
        <Operator
          operator={subCondition.operator}
          addNewLogicalSetCondition={() => addNewLogicalSetCondition({ field: datasheetFields[0], operator: 'and' })}
          update={value => update(parentIndex, null, 'operator', value)}
        />
        )}
        <div className="mlm">
          {subCondition.conditions.map((condition, childIndex) => (
            <div key={childIndex}>
              <Condition
                datasheetFields={datasheetFields}
                condition={condition}
                add={() => add(parentIndex, { field: datasheetFields[0] })}
                remove={() => remove(parentIndex, childIndex)}
                update={(field, value) => update(parentIndex, childIndex, field, value)}
                moveConditionToNextLogicSet={() => moveConditionToNextLogicSet(parentIndex, childIndex)}
              />
            </div>
          ))}
        </div>
      </div>
    ))
  )
}

function Operator ({ operator, addNewLogicalSetCondition, update }) {
  const handleOperatorChange = (value) => {
    if (value === 'new_logic_set') {
      addNewLogicalSetCondition()
    } else {
      update(value)
    }
  }

  if (operator === 'if') {
    return <div className={cs([css.operator, 'mbm'])}>If</div>
  }
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
