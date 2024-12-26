import React from 'react'
import { Input } from 'antd'
import { Question } from '../../interfaces'

interface Props {
  name: string
  model: Question
  index: number
  readOnly: boolean
  onChange: (i: number, value: string) => void
  id: string
}

const TextArea: React.FC<Props> = ({
  onChange, name, model: { result: { answers } }, index, readOnly, id,
}) => (
  <Input.TextArea
    id={id}
    name={name}
    disabled={readOnly}
    value={answers[index].value}
    onChange={({ target: { value } }): void => onChange(index, value)}
  />
)

export default TextArea
