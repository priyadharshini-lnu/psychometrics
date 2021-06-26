import React from 'react'

import { BuilderModel } from 'modules/survey/interfaces/questions/TextEntry'

import Select from './Select'

interface Props {
  model: BuilderModel
  index: number
}

const MultiSelect: React.FC<Props> = props => (
  <Select {...props} multi />
)
export default MultiSelect
