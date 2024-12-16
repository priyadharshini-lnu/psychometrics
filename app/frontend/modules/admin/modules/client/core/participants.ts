import * as t from 'io-ts'


import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { appendToList, createReducer, removeFromList } from '~/utils/redux'
import { RootState } from '~/modules/admin/core/rootReducers'

import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'

const ParticipantInfoTR = {
  id: t.number,
  userId: t.number,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
  createdAt: t.string,
}
const ParticipantCampaignsTR = t.array(
  t.type({
    id: t.number,
    name: t.string,
  }),
)
const ParticipantPermissionsTR = t.type({
  edit: t.boolean,
  resetPassword: t.boolean,
  sendMail: t.boolean,
  remove: t.boolean,
})
const ParticipantTR = t.type({
  ...ParticipantInfoTR,
  campaigns: ParticipantCampaignsTR,
  permissions: ParticipantPermissionsTR,
})

export type Participant = t.TypeOf<typeof ParticipantTR>

export const FETCH = 'projects/participants/FETCH'
const FetchResponseTR = t.type({
  list: t.array(ParticipantTR),
  total: t.number,
})
export type FetchResponse = t.TypeOf<typeof FetchResponseTR>
export type FetchAction = ApiActionResponse<FetchResponse>
export const fetch = (projectId: number, tableConfig: TableConfig): ApiAction<FetchResponse> => ({
  type: FETCH,
  request: {
    method: 'get',
    loader: true,
    camelize: false,
    tableConfig,
    typedResponse: FetchResponseTR,
    url: `/administration/projects/${projectId}/participants`,
  },
})

export const FETCH_SINGLE = 'resource/projects/participants/FETCH'
const FetchSingleResponseTR = ParticipantTR
type FetchSingleResponse = t.TypeOf<typeof FetchSingleResponseTR>
type FetchSingleAction = ApiActionResponse<FetchSingleResponse>

export const RESET_PASSWORD = 'projects/participants/RESET_PASSWORD'
const ResetPasswordTR = t.literal('ok')
type ResetPassword = t.TypeOf<typeof ResetPasswordTR>
export const resetPassword = (
  projectId: number,
  participantId: Participant['id'],
): ApiAction<ResetPassword> => ({
  type: RESET_PASSWORD,
  request: {
    method: 'get',
    loader: true,
    camelize: true,
    typedResponse: ResetPasswordTR,
    url: `/administration/projects/${projectId}/participants/${participantId}/reset_password`,
  },
})

export const REMOVE = 'projects/participants/REMOVE_ADMIN'
const RemoveResponseTR = t.type({
  id: ParticipantInfoTR.id,
})
type RemoveResponse = t.TypeOf<typeof RemoveResponseTR>
type RemoveAction = ApiActionResponse<RemoveResponse>
export const remove = (
  projectId: number,
  participantId: Participant['id'],
): ApiAction<RemoveResponse> => ({
  type: REMOVE,
  request: {
    method: 'delete',
    loader: true,
    camelize: true,
    typedResponse: RemoveResponseTR,
    url: `/administration/projects/${projectId}/participants/${participantId}`,
  },
})

export const UPDATE = 'resource/projects/participants/UPDATE'
type UpdateResponse = Participant
type UpdateAction = ApiActionResponse<UpdateResponse>

export const CLEAR_CURRENT = 'resource/projects/participants/CLEAR_CURRENT'
export const clearCurrent = () => ({
  type: CLEAR_CURRENT,
})

type State = {
  list: Participant[]
  current: Participant | undefined
  total: number
}

const defaultState: State = {
  list: [],
  current: undefined,
  total: 0,
}

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchAction) => ({ ...state, list: response.list, total: response.total }),
  [FETCH_SINGLE]: (state: State, { response }: FetchSingleAction) => ({
    ...state,
    current: response,
  }),
  [UPDATE]: (state: State, { response }: UpdateAction) => appendToList(state, response),
  [REMOVE]: (state: State, { response }: RemoveAction) => removeFromList(state, response),
  [CLEAR_CURRENT]: (state: State) => ({ ...state, current: undefined }),
}

export const reducer = createReducer(HANDLERS, defaultState)

export const getList = (state: RootState) => state.project.participants.list
export const getTotal = (state: RootState) => state.project.participants.total
export const getCurrent = (state: RootState) => state.project.participants.current
