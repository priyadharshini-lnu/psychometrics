import React from 'react'
import Select from './Select'
import { Question } from '../../interfaces'

interface Props {
  model: Question
  index: number
  onChange: (i: number, value: string) => void
}

const MultiSelect: React.FC<Props> = props => (
  <Select {...props} multi />
)
export default MultiSelect
