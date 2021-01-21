import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from 'modules/admin/core/rootReducers'
import { FetchSingle } from './users'

export const UserAssessmentTR = t.type({
  id: t.number,
  assessmentName: t.string,
})
export type UserAssessment = t.TypeOf<typeof UserAssessmentTR>

export type State = UserAssessment[]

const defaultState: State = []

export const get = (state: RootState): State => _.get(state, ['assessors', 'userAssessments'])

const FETCH_SINGLE_USER = 'assessors/users/FETCH_SINGLE'

const HANDLERS = {
  [FETCH_SINGLE_USER]: (state: State, { response }: ApiActionResponse<FetchSingle>) => response.userAssessments,
}

export default createReducer(HANDLERS, defaultState)
