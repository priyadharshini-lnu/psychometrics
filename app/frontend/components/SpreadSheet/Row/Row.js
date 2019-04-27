import React from 'react'
import _ from 'lodash'

export default function Row ({
  isLast, addRow, updateEntity, index, fields, entity,
}) {
  const onKeyDown = (key, index) => {
    if (key === 'Tab' && isLast && index === _.size(fields) - 1) addRow()
  }

  const onChange = ({ currentTarget }) => {
    updateEntity([index, currentTarget.name], currentTarget.value)
  }

  return (
    <tr>
      {fields.map((field, index) => (
        <td key={field.key}>
          <input
            onKeyDown={({ key }) => onKeyDown(key, index)}
            name={field.key}
            value={entity[field.key] || ''}
            onChange={onChange}
          />
        </td>
      ))}
    </tr>
  )
}
