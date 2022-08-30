import React, { FC } from 'react'
import { MultipleChoice } from './MultipleChoice'
import { TextEntry } from './TextEntry'

const FIELDS = {
  MultipleChoice, TextEntry,
}

interface Props {
  field: {
    id: number
    question: {
      id: number
      type: string
      props:{
        type: string
        choices: number
        choicesTexts: string[]
      }
    }
  }
  value?: string
  onChange?: (value) => void
}

const CustomField: FC<Props> = ({ field, value, onChange }) => {
  const Field = FIELDS[field.question.type]
  return (
    <Field field={field.question} value={value} onChange={onChange} />
  )
}

export { CustomField }
