import Select from 'react-select'

const getFields = (field, context) => field.items(context)
  .map(item => ({ label: item.label, value: field.getValue(item) }))

const Autocomplete = ({
  field, context, insert, onSelect, preventInsert,
}) => {
  const handleSelect = ({ value }) => {
    !preventInsert && insert(value)
    onSelect && onSelect(value)
  }

  return (
    <div>
      <Select
        name="form-field-name"
        placeholder={field.name}
        options={getFields(field, context)}
        clearable={false}
        autoFocus={false}
        onChange={handleSelect}
      />
    </div>
  )
}

export default Autocomplete
