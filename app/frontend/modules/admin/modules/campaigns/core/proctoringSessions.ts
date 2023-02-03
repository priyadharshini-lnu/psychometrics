import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import _ from 'lodash'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'
import { FETCH_SINGLE as FETCH_SINGLE_USER } from './users'

export interface ProctoringSession {
  id: number
  startedAt: string
  completedAt: string
  score: number
  archiveUrl: string
  reportUrl: string
  comment: string
}

const defaultState = {
  list: [] as ProctoringSession[],
}
export type State = typeof defaultState

export const get = (state: RootState): State => _.get(state, ['campaigns', 'proctoringSessions'])

const HANDLERS = {
  [FETCH_SINGLE_USER]: (state, { response }: ApiActionResponse<{ proctoringSessions: ProctoringSession[] }>) => (
    { ...state, list: response.proctoringSessions }),
}

export const reducer = createReducer(HANDLERS, defaultState)
