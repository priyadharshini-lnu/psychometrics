import { FC } from 'react'
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
    translations: {}
    locked: boolean
  }
  value?: string
  defaultValue?: string
  onChange?: (value) => void
}

const CustomField: FC<Props> = ({
  field, value, onChange, defaultValue,
}) => {
  const Field = FIELDS[field.question.type]
  return (
    <Field
      field={field.question}
      translations={field.translations}
      locked={field.locked}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
    />
  )
}

export { CustomField }
