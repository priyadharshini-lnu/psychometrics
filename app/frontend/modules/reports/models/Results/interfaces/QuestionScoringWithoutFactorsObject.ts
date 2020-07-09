export default interface QuestionScoringWithoutFactorsObject {
  [questionId: string]: QuestionScoring
}

export interface QuestionScoring {
  sum: number
  avg: number
  values: number[]
}
