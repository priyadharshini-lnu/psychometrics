import * as t from 'io-ts'

import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { RootState } from '~/modules/admin/core/rootReducers'

import { appendToList, createReducer, removeFromList } from '~/utils/redux'

const AssessorInfoTR = {
  id: t.number,
  userId: t.number,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
  createdAt: t.string,
}
const AssessorCampaignsTR = t.array(
  t.type({
    id: t.number,
    name: t.string,
  }),
)
const AssessorPermissionsTR = t.type({
  edit: t.boolean,
  resetPassword: t.boolean,
  sendMail: t.boolean,
  remove: t.boolean,
})
const AssessorTR = t.type({
  ...AssessorInfoTR,
  campaigns: AssessorCampaignsTR,
  permissions: AssessorPermissionsTR,
})
export type Assessor = t.TypeOf<typeof AssessorTR>

export const FETCH = 'projects/assessors/FETCH'
const FetchResponseTR = t.type({
  total: t.number,
  list: t.array(AssessorTR),
})
type FetchResponse = t.TypeOf<typeof FetchResponseTR>
type FetchAction = ApiActionResponse<FetchResponse>
export const fetch = (
  projectId: number,
  tableConfig: TableConfig,
): ApiAction<FetchResponse> => ({
  type: FETCH,
  request: {
    method: 'get',
    loader: true,
    camelize: true,
    tableConfig,
    typedResponse: FetchResponseTR,
    url: `/administration/projects/${projectId}/assesssors`,
  },
})

export const FETCH_SINGLE = 'resource/projects/assesssors/FETCH'
const FetchSingleResponseTR = AssessorTR
type FetchSingleResponse = t.TypeOf<typeof FetchSingleResponseTR>
type FetchSingleAction = ApiActionResponse<FetchSingleResponse>

export const RESET_PASSWORD = 'projects/assessors/RESET_PASSWORD'
const ResetPasswordTR = t.literal('ok')
type ResetPassword = t.TypeOf<typeof ResetPasswordTR>
export const resetPassword = (
  projectId: number,
  assessorId: Assessor['id'],
): ApiAction<ResetPassword> => ({
  type: RESET_PASSWORD,
  request: {
    method: 'get',
    loader: true,
    camelize: true,
    typedResponse: ResetPasswordTR,
    url: `/administration/projects/${projectId}/assesssors/${assessorId}/reset_password`,
  },
})

export const REMOVE = 'projects/assessors/REMOVE_ADMIN'
const RemoveResponseTR = t.type({
  id: AssessorInfoTR.id,
})
type RemoveResponse = t.TypeOf<typeof RemoveResponseTR>
type RemoveAction = ApiActionResponse<RemoveResponse>
export const remove = (
  projectId: number,
  assessorId: Assessor['id'],
): ApiAction<RemoveResponse> => ({
  type: REMOVE,
  request: {
    method: 'delete',
    loader: true,
    camelize: true,
    typedResponse: RemoveResponseTR,
    url: `/administration/projects/${projectId}/assesssors/${assessorId}`,
  },
})

export const UPDATE = 'resource/projects/assesssors/UPDATE'
type UpdateResponse = Assessor
type UpdateAction = ApiActionResponse<UpdateResponse>

export const CLEAR_SINGLE = 'campaigns/admins/CLEAR_SINGLE_ADMIN'
export const clearSingle = () => ({ type: CLEAR_SINGLE })

export type State = {
  current?: Assessor
  total: number
  list: Array<Assessor>
}

const defaultState: State = {
  current: undefined,
  total: 0,
  list: [],
}

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchAction) => ({
    ...state,
    ...response,
  }),
  [FETCH_SINGLE]: (state: State, { response }: FetchSingleAction) => ({
    ...state,
    current: response,
  }),
  [UPDATE]: (state: State, { response }: UpdateAction) => appendToList(state, response),
  [REMOVE]: (state: State, { response }: RemoveAction) => removeFromList(state, response),
  [CLEAR_SINGLE]: (state: State) => ({ ...state, current: undefined }),
}

export const reducer = createReducer(HANDLERS, defaultState)

export const getList = (state: RootState) => state.project.assessors.list
export const getTotal = (state: RootState) => state.project.assessors.total
export const getCurrent = (state: RootState) => state.project.assessors.current
