import React from 'react'
import _ from 'lodash'
import Criteria from './Criteria'
import css from "./style.scss"
import { Select } from 'antd'
import cs from 'classnames'

export default function AvailablityRequirement ({
  conditions
}) {
  return conditions.map((sub_condition, index) => (
    <div className="mbs" key={index}>
      <Operator operator={sub_condition.operator} />
      <div className="mlm">
        {sub_condition.conditions.map((condition, index) => (
          <div className="mbs" key={index}>
            <Criteria
              condition={condition} />
          </div>
        ))}
      </div>
    </div>
  ))
}

function Operator({ operator }) {
  if (operator === 'if') {
    return <div className={cs([css.operator, 'mbm'])}>If</div>
  } else {
    return (
      <Select
        value={operator}
        className={cs([css.inputElement, css.operator, 'mbm', 'mtm'])}
        dropdownMatchSelectWidth={false}>
        <Select.Option key="and">And If</Select.Option>
        <Select.Option key="or">Or If</Select.Option>
        <Select.Option key="new_logic_set">Add Anthore Logic Set</Select.Option>
      </Select>
    )
  }
}
