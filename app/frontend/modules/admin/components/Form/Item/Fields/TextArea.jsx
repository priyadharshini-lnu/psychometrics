import React from 'react'
import { Input as AntInput } from 'antd'

export default function TextArea ({ field: { value, name }, onChange }) {
  return <AntInput.TextArea name={name} value={value} onChange={onChange} />
}
