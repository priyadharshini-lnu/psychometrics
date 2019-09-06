import React, { useEffect } from 'react'
import { Select, Input } from 'antd'
import style from '../../style.scss'

export default function DatasheetComparator ({
  datasheetFields, subField, value, update, merge,
}) {
  useEffect(() => {
    merge({ subField: datasheetFields[0], comparator: 'equal' })
  }, [])

  return (
    <div>
      <Select
        dropdownMatchSelectWidth={false}
        size="small"
        value={subField}
        onChange={value => update('subField', value)}
      >
        {datasheetFields.map(name => (
          <Select.Option key={name}>{name}</Select.Option>
        ))}
      </Select>
      <Input className={style.smallInput} size="small" value={value} onChange={e => update('value', e.target.value)} />
    </div>
  )
}
