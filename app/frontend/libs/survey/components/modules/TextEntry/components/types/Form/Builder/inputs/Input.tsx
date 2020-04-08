import React from 'react'
import { Input as BaseInput } from 'antd'

interface Props {
  name: string
}

const Input: React.FC<Props> = ({ name }) => (
  <BaseInput name={name} />
)

export default Input
