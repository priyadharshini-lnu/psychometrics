import { RawResult } from './Results/interfaces'

declare class Filter {
  constructor(args)

  id: number

  name: string

  conditions: FilterCondition[]

  assessmentId: number

  minRequiredResponses: number

  correctByFilter(data: RawResult): boolean
}

interface FilterCondition {
  type: string
  props: FilterProps
}

interface FilterProps {
  predicate: string
  value: string
}

export = Filter
