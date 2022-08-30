
import React, { FC } from 'react'
import { Input } from 'antd'

interface Props {
  field: {
    id: number
    props:{
      type: string
      choices: number
      choicesTexts: string[]
    }
  }
  value: string
  onChange: (value:string) => void
}

export const TextEntry: FC<Props> = ({ field, value, onChange }) => {
  const change = (e) => {
    onChange(e.currentTarget.value)
  }

  if (field.props.type === 'SingleLine') {
    return (
      <div>
        <Input value={value} onChange={change} />
      </div>
    )
  }

  if (field.props.type === 'MultiLine') {
    return (
      <div>
        <Input.TextArea rows={4} value={value} onChange={change} />
      </div>
    )
  }

  return null
}
