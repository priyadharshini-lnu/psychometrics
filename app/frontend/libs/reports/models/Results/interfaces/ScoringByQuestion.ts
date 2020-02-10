import Scoring from '../../Scoring'

export default interface ScoringByQuestion {
  [factorId: string]: QuestionScoringObject
}

export interface QuestionScoringObject {
  [questionId: string]: Scoring | string
  name: string
}
