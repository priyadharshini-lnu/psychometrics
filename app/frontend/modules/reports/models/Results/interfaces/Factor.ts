export default interface Factor {
  id: number
  name: string
  alias: string
  position: number
  subFactors: Factor[]
  icon: string | null
  description: string
  scoring_strategy: string
  parent_id: number | null
  question_ids: number[]
}
