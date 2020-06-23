import React from 'react'
import { Input as BaseInput } from 'antd'
import { Question } from '../../interfaces'

interface Props {
  name: string
  model: Question
  index: number
  onChange: (i: number, value: string) => void
}

const Input: React.FC<Props> = ({
  onChange, name, model: { result: { answers } }, index,
}) => (
  <BaseInput
    name={name}
    value={answers[index].value}
    onChange={({ target: { value } }): void => onChange(index, value)}
  />
)

export default Input
