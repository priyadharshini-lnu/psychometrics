import { MediaResponse } from 'modules/survey/core/preview/FlowProcessor/interfaces'

export default interface RawResult {
  scoring: RawResultScoring
  embedded_data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  results: {
    [questionId: string]: QuestionsResult
  }
  user_id: number
  user: User
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  external_scoring: any
  data_sheet: object
  subject_datasheet: object
  media_responses: MediaResponse[]
}

export interface ScoringResult {
  value: number | number[]
  question_id: number
}

export interface QuestionsResult {
  answers: object[]
}

interface RawResultScoring {
  score: number
  norm_score: number
  results: ScoringResult[]
}

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
}
