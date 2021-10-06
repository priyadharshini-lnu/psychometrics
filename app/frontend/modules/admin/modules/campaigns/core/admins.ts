import * as t from 'io-ts'

import { createReducer, appendToList, removeFromList } from 'utils/redux'

import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { RootState } from 'modules/admin/core/rootReducers'

const AdminInfoTR = {
  id: t.union([t.null, t.number]),
  userId: t.union([t.null, t.number]),
  firstName: t.union([t.null, t.string]),
  lastName: t.union([t.null, t.string]),
  email: t.string,
  createdAt: t.union([t.null, t.string]),
}
const AdminPermissionsTR = t.type({
  loginAs: t.boolean,
  edit: t.boolean,
  remove: t.boolean,
  resetPassword: t.boolean,
  sendMail: t.boolean,
})
const AdminGrantsTR = t.type({
  id: t.union([t.null, t.number]),
  membershipId: t.union([t.null, t.number]),
  data: t.partial({
    clients: t.array(t.string),
    reports: t.array(t.string),
    results: t.array(t.string),
    projects: t.array(t.string),
    assessors: t.array(t.string),
    campaigns: t.array(t.string),
    datasheets: t.array(t.string),
    communications: t.array(t.string),
    registrationCodes: t.array(t.string),
  }),
})
const AdminCampaignsTR = t.array(
  t.type({
    id: t.number,
    name: t.string,
  }),
)
const AdminTR = t.type({
  ...AdminInfoTR,
  permissions: AdminPermissionsTR,
  grants: AdminGrantsTR,
  campaigns: AdminCampaignsTR,
})
export type Admin = t.TypeOf<typeof AdminTR>

export const FETCH = 'campaigns/admins/FETCH_ADMINS'
const FetchResponseTR = t.type({
  total: t.number,
  permissions: t.type({
    create: t.boolean,
  }),
  list: t.array(
    t.type({
      ...AdminInfoTR,
      permissions: AdminPermissionsTR,
    }),
  ),
})
type FetchResponse = t.TypeOf<typeof FetchResponseTR>
type FetchAction = ApiActionResponse<FetchResponse>
export const fetch = (
  campaignId: number,
  tableConfig: TableConfig,
): ApiAction<FetchResponse> => ({
  type: FETCH,
  request: {
    method: 'get',
    loader: true,
    camelize: true,
    tableConfig,
    typedResponse: FetchResponseTR,
    url: `/administration/new_campaigns/${campaignId}/admins`,
  },
})

export const FETCH_SINGLE = 'campaigns/admins/FETCH_SINGLE_ADMIN'
type FetchSingleAction = ApiActionResponse<Admin>
export const fetchSingle = (
  campaignId: number,
  adminId: Admin['id'],
): ApiAction<Admin> => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    loader: true,
    camelize: true,
    typedResponse: AdminTR,
    url: `/administration/new_campaigns/${campaignId}/admins/${adminId}`,
  },
})

export const CLEAR_SINGLE = 'campaigns/admins/CLEAR_SINGLE_ADMIN'
export const clearSingle = () => ({ type: CLEAR_SINGLE })

export const SEARCH = 'campaigns/admins/SEARCH_ADMIN'
const SearchResponseTR = t.type({
  ...AdminInfoTR,
  grants: AdminGrantsTR,
})
type SearchResponse = t.TypeOf<typeof SearchResponseTR>
type SearchAction = ApiActionResponse<SearchResponse>
export const search = (
  campaignId: number,
  email: Admin['email'],
): ApiAction<SearchResponse> => ({
  type: SEARCH,
  request: {
    method: 'get',
    body: {
      email,
    },
    loader: true,
    camelize: true,
    typedResponse: SearchResponseTR,
    url: `/administration/new_campaigns/${campaignId}/admins/find_or_create_user`,
  },
})

export const UPDATE = 'campaigns/admins/UPDATE_ADMIN'
export type CreateRequest = {
  resource: {
    userAttributes: {
      email: Admin['email']
      firstName: Admin['firstName']
      lastName: Admin['lastName']
    }
    grantsAttributes: {
      data: Admin['grants']['data']
    }
  }
}
export type UpdateRequest = CreateRequest & {
  resource: {
    userAttributes: {
      id: Admin['userId']
    }
  }
}
const UpdateResponseTR = t.type({
  ...AdminInfoTR,
  permissions: AdminPermissionsTR,
})
type UpdateResponse = t.TypeOf<typeof UpdateResponseTR>
export const update = (
  campaignId: number,
  adminId: Admin['id'],
  body: UpdateRequest,
): ApiAction<UpdateResponse> => ({
  type: UPDATE,
  request: {
    method: 'put',
    body,
    loader: true,
    camelize: true,
    typedResponse: UpdateResponseTR,
    url: `/administration/new_campaigns/${campaignId}/admins/${adminId}`,
  },
})

export const CREATE = 'campaigns/admins/CREATE_ADMIN'
export const create = (
  campaignId: number,
  body: CreateRequest,
): ApiAction<UpdateResponse> => ({
  type: CREATE,
  request: {
    method: 'post',
    body,
    loader: true,
    camelize: true,
    typedResponse: UpdateResponseTR,
    url: `/administration/new_campaigns/${campaignId}/admins`,
  },
})

export const REMOVE = 'campaigns/admins/REMOVE_ADMIN'
const RemoveResponseTR = t.type({
  id: AdminInfoTR.id,
})
type RemoveResponse = t.TypeOf<typeof RemoveResponseTR>
type RemoveAction = ApiActionResponse<RemoveResponse>
export const remove = (
  campaignId: number,
  adminId: Admin['id'],
): ApiAction<RemoveResponse> => ({
  type: REMOVE,
  request: {
    method: 'delete',
    loader: true,
    camelize: true,
    typedResponse: RemoveResponseTR,
    url: `/administration/new_campaigns/${campaignId}/admins/${adminId}`,
  },
})

export const RESET_PASSWORD = 'campaigns/admins/RESET_PASSWORD'
const ResetPasswordTR = t.literal('ok')
type ResetPassword = t.TypeOf<typeof ResetPasswordTR>
export const resetPassword = (
  campaignId: number,
  adminId: Admin['id'],
): ApiAction<ResetPassword> => ({
  type: RESET_PASSWORD,
  request: {
    method: 'get',
    loader: true,
    camelize: true,
    typedResponse: ResetPasswordTR,
    url: `/administration/new_campaigns/${campaignId}/admins/${adminId}/reset_password`,
  },
})

export type State = {
  current: Partial<Admin> | null
  total: number
  list: Array<Omit<Admin, 'campaigns' | 'grants'>>
  permissions: {
    create: boolean
  }
}

const defaultState: State = {
  current: null,
  total: 0,
  list: [],
  permissions: {
    create: false,
  },
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
  [CLEAR_SINGLE]: (state: State) => ({ ...state, current: null }),
  [SEARCH]: (state: State, { response }: SearchAction) => ({
    ...state,
    current: response,
  }),
  [CREATE]: (state: State, { response }: FetchSingleAction) => appendToList(state, response),
  [UPDATE]: (state: State, { response }: FetchSingleAction) => appendToList(state, response),
  [REMOVE]: (state: State, { response }: RemoveAction) => removeFromList(state, response),
}

export default createReducer(HANDLERS, defaultState)

export const getList = (state: RootState) => state.campaigns.admins.list
export const getTotal = (state: RootState) => state.campaigns.admins.total
export const getPermissions = (state: RootState) => state.campaigns.admins.permissions
export const getCurrent = (state: RootState) => state.campaigns.admins.current
