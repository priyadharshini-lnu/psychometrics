import { ChangeEvent } from 'react'

import { Question } from 'modules/survey/interfaces/builder/Question'

export interface ValidationFieldsProps {
  model: Question
  changeValidationArg: (event: ChangeEvent<HTMLInputElement>) => void
}
