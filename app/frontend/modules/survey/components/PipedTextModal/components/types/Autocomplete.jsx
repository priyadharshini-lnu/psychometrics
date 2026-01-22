import { Select } from 'antd'

const getFields = (field, context) => field.items(context).map(item => ({
  label: item.label, value: field.getValue(item),
}))

const Autocomplete = ({ field, context, insert }) => {
  const onSelect = (value) => {
    insert(value)
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <Select
        placeholder={field.name}
        options={getFields(field, context)}
        onChange={onSelect}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default Autocomplete
