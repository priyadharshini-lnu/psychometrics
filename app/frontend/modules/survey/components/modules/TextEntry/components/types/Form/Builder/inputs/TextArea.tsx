import React from 'react'
import { Input } from 'antd'

interface Props {
  name: string
}

const TextArea: React.FC<Props> = ({ name }) => (
  <Input.TextArea name={name} />
)

export default TextArea
