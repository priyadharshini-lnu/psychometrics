import { ChangeEvent } from 'react'

import { BasePropertiesModel } from 'modules/survey/interfaces/questions/Base'

export interface ValidationFieldsProps {
  model: BasePropertiesModel
  changeValidationArg: (event: ChangeEvent<HTMLInputElement>) => void
}
