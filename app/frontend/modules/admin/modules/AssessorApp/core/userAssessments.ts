import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'
import { FetchSingle } from './users'

// Mirrors the UserAssessment#status enum serialized by Administration::Assessors::UserAssessmentSerializer.
export const UserAssessmentStatusTR = t.keyof({
  not_started: null,
  in_progress: null,
  completed: null,
  interrupted: null,
  timed_out: null,
  ineligible: null,
})
export type UserAssessmentStatus = t.TypeOf<typeof UserAssessmentStatusTR>

export const UserAssessmentTR = t.type({
  id: t.number,
  assessmentId: t.number,
  assessmentName: t.string,
  status: UserAssessmentStatusTR,
  responsesCount: t.number,
})
export type UserAssessment = t.TypeOf<typeof UserAssessmentTR>

export type State = UserAssessment[]

const defaultState: State = []

export const get = (state: RootState): State => _.get(state, ['assessors', 'userAssessments'])

// A row is only 'completed' once every response behind it is, so the assessor is done when every row is.
export const isEvaluationCompleted = (state: RootState): boolean => {
  const userAssessments = get(state)

  return !_.isEmpty(userAssessments) && userAssessments.every(({ status }) => status === 'completed')
}

const FETCH_SINGLE_USER = 'assessors/users/FETCH_SINGLE'

const HANDLERS = {
  [FETCH_SINGLE_USER]: (state: State, { response }: ApiActionResponse<FetchSingle>) => response.userAssessments,
}

export default createReducer(HANDLERS, defaultState)
