/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface AssessmentInterface {
  id: number
  name: string
  flow: {}
  norm_rules: []
  default_norm_id: number
  enable_back: boolean
  enable_progress: boolean
  blocks?: any[]
  extra: any
  data_sheet_columns: { name: string, type: string }[]
  options: {}
  instructions: {
    enabled: boolean
    content: string
  }
  linked_questions: {[key:number]: number[]}
}
