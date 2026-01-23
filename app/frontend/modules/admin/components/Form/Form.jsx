import { Form as AntForm } from 'antd'
import Item from './Item'

export default function Form ({
  fields, context, onChange, resource,
}) {
  return (
    <AntForm layout="vertical" colon={false}>
      {fields.map(field => (
        <Item
          key={field.name}
          field={{ ...field, value: resource[field.name] || '' }}
          context={context}
          onChange={onChange}
        />
      ))}
    </AntForm>
  )
}
