import React from 'react'
import types from './types'

export default function Row ({
  isLast, addRow, updateEntity, index, fields, entity, context,
}) {
  return (
    <tr>
      {fields.map((field, number) => {
        const Component = types[field.type || 'Input']
        return (
          <td key={field.key}>
            <Component
              context={context}
              field={field}
              number={number}
              index={index}
              entity={entity}
              fields={fields}
              addRow={addRow}
              isLast={isLast}
              updateEntity={updateEntity}
            />
          </td>
        )
      })}
    </tr>
  )
}
