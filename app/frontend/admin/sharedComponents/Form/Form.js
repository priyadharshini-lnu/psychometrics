import React from 'react'
import Item from './Item'

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
          onChange={onChange}
        />
      ))}
    </>
  )
}
