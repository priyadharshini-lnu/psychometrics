import React from 'react'
import { Input } from 'antd'
import { Question } from '../../interfaces'

interface Props {
  name: string
  model: Question
  index: number
  readOnly: boolean
  onChange: (i: number, value: string) => void
}

const TextArea: React.FC<Props> = ({
  onChange, name, model: { result: { answers } }, index, readOnly,
}) => (
  <Input.TextArea
    name={name}
    disabled={readOnly}
    value={answers[index].value}
    onChange={({ target: { value } }): void => onChange(index, value)}
  />
)

export default TextArea
