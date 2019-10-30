import React from 'react'
import { Input as AntInput } from 'antd'

export default function Input ({ field: { value, name }, onChange }) {
  return <AntInput name={name} value={value} onChange={onChange} />
}
