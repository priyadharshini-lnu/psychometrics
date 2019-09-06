import React, { useEffect } from 'react'
import { Select } from 'antd'
import _ from 'lodash'

export default function Relationship ({
  relationships, value, update, merge,
}) {
  useEffect(() => {
    merge({ value: _.get(relationships, [0, 'id']), comparator: 'equal' })
  }, [])

  return (
    <div>
      <Select dropdownMatchSelectWidth={false} size="small" value={value} onChange={value => update('value', value)}>
        {relationships.map(r => (
          <Select.Option key={r.id} value={r.id}>
            {r.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}
