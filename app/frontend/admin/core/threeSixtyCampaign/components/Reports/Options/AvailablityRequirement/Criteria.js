import React from 'react'
import { Input, Select, Icon } from 'antd'
import css from "./style.scss"

export default function Criteria ({
  condition: { operator, type, numberOfEvaluator, relationship }
}) {

  return (
    <span>
      {function() {
        if (operator !== "if") {
          return (
            <Select
              value={operator}
              size="small"
              dropdownMatchSelectWidth={false}
              className={css.inputElement}>
              <Select.Option key="and">And</Select.Option>
              <Select.Option key="or">Or</Select.Option>
              <Select.Option key="new_logic_set">Move to new logic set</Select.Option>
            </Select>
          )
        }
      }()}

      <Input
        value={numberOfEvaluator}
        size="small"
        className={css.inputElement}
      />

      <Select
        value={type}
        size="small"
        className={css.inputElement}
        dropdownMatchSelectWidth={false}>
        <Select.Option key="and">Evaluation(s)</Select.Option>
      </Select>

      <Select
        value={relationship}
        size="small"
        className={css.inputElement}
        dropdownMatchSelectWidth={false}>
        <Select.Option key="Direct Report">Direct Report</Select.Option>
        <Select.Option key="Manager">Managers</Select.Option>
        <Select.Option key="Peers">Peers</Select.Option>
        <Select.Option key="Self">Self</Select.Option>
      </Select>

      <span>
        <Icon type="minus-circle" className={css.deleteIcon} />
        <Icon type="plus-circle" className={css.addIcon} />
      </span>
    </span>
  )
}
