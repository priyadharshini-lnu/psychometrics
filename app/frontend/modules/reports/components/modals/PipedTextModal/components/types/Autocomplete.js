import React from 'react'
import Select from 'react-select'

const getFields = (field, context) => field.items(context)
  .map(item => ({ label: item.label, value: field.getValue(item) }))

const Autocomplete = ({ field, context, insert }) => {
  const onSelect = ({ value }) => {
    insert(value)
  }

  return (
    <div>
      <Select
        name="form-field-name"
        placeholder={field.name}
        options={getFields(field, context)}
        clearable={false}
        autoFocus={false}
        onChange={onSelect}
      />
    </div>
  )
}

export default Autocomplete
