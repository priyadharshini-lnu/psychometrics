import React from 'react'
import { Input as BaseInput } from 'antd'
import { Question } from '../../interfaces'

interface Props {
  name: string
  model: Question
  index: number
  readOnly: boolean
  onChange: (i: number, value: string) => void
  id: string
}

const Input: React.FC<Props> = ({
  onChange, name, model: { result: { answers } }, index, readOnly, id,
}) => (
  <BaseInput
    id={id}
    disabled={readOnly}
    name={name}
    value={answers[index].value}
    onChange={({ target: { value } }): void => onChange(index, value)}
    className="spellcheck-enabled"
  />
)

export default Input
