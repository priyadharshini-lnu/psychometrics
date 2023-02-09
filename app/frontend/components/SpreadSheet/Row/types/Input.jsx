import _ from 'lodash'

export default function Input ({
  field, entity, index, number, fields, isLast, addRow, updateEntity,
}) {
  const onKeyDown = (key, index) => {
    if (key === 'Tab' && isLast && index === _.size(fields) - 1) addRow()
  }

  const onChange = ({ currentTarget }) => {
    updateEntity([index, field.key], currentTarget.value)
  }

  return (
    <input
      onKeyDown={({ key }) => onKeyDown(key, number)}
      value={entity[field.key] || ''}
      onChange={onChange}
      autoComplete="off"
    />
  )
}
