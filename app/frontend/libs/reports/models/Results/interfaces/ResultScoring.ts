import Scoring from '../../Scoring'

export default interface ResultScoring {
  [key: string]: ScoringData
}

export interface ScoringData {
  id: string
  name: string
  results: Scoring[]
}
