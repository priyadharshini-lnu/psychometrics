import { ChangeEvent } from 'react'

import { QuestionInProperties } from 'modules/survey/interfaces/questions/Base'

export interface ValidationFieldsProps {
  model: QuestionInProperties
  changeValidationArg: (event: ChangeEvent<HTMLInputElement>) => void
}
