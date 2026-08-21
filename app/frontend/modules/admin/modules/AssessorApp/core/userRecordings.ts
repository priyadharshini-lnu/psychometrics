import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'
import { FetchSingle } from './users'

export const UserRecordingTR = t.type({
  id: t.number,
  externalId: t.string,
  recordingDate: t.string,
  recordingUrl: t.union([t.string, t.null]),
  assessmentCenterDateAndTime: t.union([t.string, t.null]),
  assessors: t.array(
    t.type({
      id: t.union([t.string, t.number]),
      email: t.string,
    }),
  ),
  participants: t.array(
    t.type({
      id: t.union([t.string, t.number]),
      email: t.string,
    }),
  ),
  transcriptionUrl: t.union([t.string, t.null]),
  transcriptionText: t.union([t.string, t.null]),
  disableTranscriptDownload: t.boolean,
})

export type UserRecording = t.TypeOf<typeof UserRecordingTR>

export type State = UserRecording[]

const defaultState: State = []

export const get = (state: RootState): State => _.get(state, ['assessors', 'userRecordings'])

const FETCH_SINGLE_USER = 'assessors/users/FETCH_SINGLE'

const HANDLERS = {
  [FETCH_SINGLE_USER]: (state: State, { response }: ApiActionResponse<FetchSingle>) => response.userRecordings,
}

export default createReducer(HANDLERS, defaultState)
