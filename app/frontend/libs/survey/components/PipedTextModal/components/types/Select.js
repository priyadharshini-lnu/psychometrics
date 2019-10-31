import React from 'react'

const Autocomplete = ({
  field: { name, formats, getValue }, insert,
}) => {
  const onSelect = (e) => {
    const format = e.currentTarget.value
    insert(getValue({ format }))
  }

  return (
    <div style={{ marginBottom: 1 }}>
      <select onChange={onSelect} className="form-control">
        <option disabled selected>{name}</option>
        {formats.map((format, i) => <option key={i} value={format.format}>{format.name}</option>)}
      </select>
    </div>
  )
}

export default Autocomplete
