import React from 'react'
import Item from './Item'
import { BASE_LAYOUT } from './layouts'

export default function Form ({
  fields, context, onChange, resource,
}) {
  return (
    <>
      {fields.map(field => (
        <Item
          key={field.name}
          field={{ ...field, value: resource[field.name] || '' }}
          context={context}
          layout={BASE_LAYOUT}
          onChange={onChange}
        />
      ))}
    </>
  )
}
