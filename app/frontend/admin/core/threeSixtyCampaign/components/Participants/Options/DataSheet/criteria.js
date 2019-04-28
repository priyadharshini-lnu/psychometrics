import React from 'react'
import { Input, Select } from "antd";

export default function DataSheetCriteria({condition: { field, operator, value }, updateCriteria}) {
  let valueAttr = field ? {value: field} : {};

  return (
    <span>
      <Select {...valueAttr} size="small" style={{width: '160px'}} placeholder="Select a datasheet field" onChange={(value) => { updateCriteria("field", value) }}>
        <Select.Option key="gender">Gender</Select.Option>
        <Select.Option key="grade">Grade</Select.Option>
        <Select.Option key="language">Language</Select.Option>
      </Select>
      <Select value={operator} size="small" style={{margin: "0px 10px", width: "160px"}} onChange={(value) => { updateCriteria("operator", value) }}>
        <Select.Option key="is_same_as_subject">Is Same as Subject</Select.Option>
        <Select.Option key="equal">Is</Select.Option>
      </Select>
      {operator == "equal" ? <Input value={value} style={{marginRight: '10px', width: '160px'}} size="small" onChange={(e) => { updateCriteria("value", e.target.value) }} /> : null}
    </span>
  )
}
