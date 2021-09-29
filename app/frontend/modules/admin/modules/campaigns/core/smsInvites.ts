import lodashGet from 'lodash/get'
import { createReducer } from 'utils/redux'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from 'modules/admin/core/rootReducers'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'

export const STATUSES = ['not_invited', 'invited', 'registered']

const SmsInviteTR = t.type({
  id: t.number,
  firstName: t.string,
  lastName: t.string,
  mobileNo: t.string,
  status: t.string,
  email: t.union([t.string, t.null]),
  createdAt: t.string,
  createdBy: t.string,
})

const SmsInviteListResponseTR = t.type({
  list: t.array(SmsInviteTR),
  total: t.number,
  permissions: t.type({
    import: t.boolean,
    export: t.boolean,
    sendSms: t.boolean,
  }),
})

export type SmsInvite = t.TypeOf<typeof SmsInviteTR>
export type State = t.TypeOf<typeof SmsInviteListResponseTR>

const defaultState: State = { list: [], total: 0, permissions: { import: false, export: false, sendSms: false } }

export const get = (state: RootState): State => lodashGet(state, ['campaigns', 'smsInvites'])

export const FETCH = 'camapaigns/smsInvites/FETCH'

export const fetch = (campaignId: string, tableConfig: TableConfig): ApiAction<State> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/sms_invites`,
    debounce: 500,
    tableConfig,
    typedResponse: SmsInviteListResponseTR,
  },
})

export const SEARCH = 'camapaigns/smsInvites/SEARCH'
const SearchResponseTR = t.array(
  t.type({
    id: t.number,
    fullName: t.string,
  }),
)
type SearchResponse = t.TypeOf<typeof SearchResponseTR>
export const search = (campaignId: number, searchText: string): ApiAction<SearchResponse> => ({
  type: SEARCH,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/sms_invites/search`,
    body: { filterableFields: searchText },
    typedResponse: SearchResponseTR,
  },
})

export const IMPORT = 'campaigns/smsInvites/IMPORT'
export const importSmsInvites = (campaignId: number, body: FormData) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/sms_invites/import`,
    body,
    loader: true,
  },
})

export const SEND_SMS = 'camapaigns/smsInvites/SEND_SMS'
export const sendSms = (campaignId: number, body: object) => ({
  type: SEND_SMS,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/sms_invites/send_sms`,
    body,
    loader: true,
  },
})

const HANDLERS = {
  [FETCH]: (_: State, { response }: ApiActionResponse<State>) => response,
}

export const reducer = createReducer(HANDLERS, defaultState)
