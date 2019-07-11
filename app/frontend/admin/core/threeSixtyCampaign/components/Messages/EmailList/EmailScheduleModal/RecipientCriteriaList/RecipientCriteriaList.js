import React from 'react'
import _ from 'lodash'
import { Select } from 'antd'
import Criteria from './Criteria'

export default function RecipientCriteriaList ({
  recipientCriteria, add, update, remove, merge,
}) {
  return (
    <div className="mbm">
      <div>
        <b>To:</b>
      </div>
      {_.isEmpty(recipientCriteria) && (
        <Select defaultValue="everyone" dropdownMatchSelectWidth={false} onChange={() => add()}>
          <Select.Option key="everyone">Everyone</Select.Option>
          <Select.Option key="participants">Participants By Criteria...</Select.Option>
        </Select>
      )}
      {!_.isEmpty(recipientCriteria) && (
        <div className="mbs">
          {recipientCriteria.map((criteria, index) => (
            <Criteria
              key={index}
              criteria={criteria}
              add={add}
              remove={() => remove(index)}
              update={(field, value) => update(index, field, value)}
              merge={attributes => merge(index, attributes)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
