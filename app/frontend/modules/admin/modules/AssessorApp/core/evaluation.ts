import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'

export const UserAssessmentTR = t.type({
  id: t.number,
})

export type UserAssessment = t.TypeOf<typeof UserAssessmentTR>

export const ResultTR = t.type({
  id: t.number,
})

export type Result = t.TypeOf<typeof ResultTR>

export interface State {
  loaded: boolean
  assessment: UserAssessment | null
  result: Result | null
}

const defaultState: State = {
  loaded: false,
  assessment: null,
  result: null,
}

const FETCH_ASSESSOR_ASSESSMENT = 'assessors/evaluating/FETCH_ASSESSOR_ASSESSMENT'
const FETCH_SUBJECT_ASSESSMENT = 'assessors/evaluating/FETCH_SUBJECT_ASSESSMENT'

// TODO: @fedor implement typedResponse and assessment/result type
type FetchType = ApiActionResponse<{
  assessment: UserAssessment,
  result: Result,
}>

export const fetchAssessorAssessment = (evaluationId: number) => ({
  type: FETCH_ASSESSOR_ASSESSMENT,
  request: {
    method: 'get',
    url: `/assessors/evaluations/${evaluationId}`,
    camelize: false,
  },
})

export const fetchSubjectAssessment = (evaluationId: number) => ({
  type: FETCH_SUBJECT_ASSESSMENT,
  request: {
    method: 'get',
    url: `/assessors/evaluations/${evaluationId}/subject_assessment`,
    camelize: false,
  },
})

const HANDLERS = {
  [FETCH_ASSESSOR_ASSESSMENT]: (state: State, { response }: FetchType) => ({ ...response, loaded: true }),
  [FETCH_SUBJECT_ASSESSMENT]: (state: State, { response }: FetchType) => ({ ...response, loaded: true }),
}

export default createReducer(HANDLERS, defaultState)
