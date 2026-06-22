import _ from 'lodash'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { createReducer } from '~/utils/redux'
import { setIn } from '~/utils/immutable'

const LogTR = t.type({
  id: t.number,
  action: t.string,
  outcome: t.union([t.string, t.undefined, t.null]),
  failureReason: t.union([t.string, t.undefined, t.null]),
  user: t.union([
    t.type({
      fullName: t.string,
      email: t.string,
    }),
    t.undefined,
    t.null,
  ]),
  payload: t.any,
  client: t.any,
  project: t.any,
  campaign: t.any,
  impersonator: t.union([
    t.type({
      fullName: t.string,
      email: t.string,
    }),
    t.undefined,
    t.null,
  ]),
  activeRecordAudits: t.union([
    t.array(
      t.type({
        id: t.number,
        auditableType: t.string,
        auditableId: t.number,
        action: t.string,
        auditedChanges: t.any,
      }),
    ),
    t.undefined,
    t.null,
  ]),
  recordType: t.union([t.string, t.null]),
  recordId: t.union([t.number, t.null]),
  requestUuid: t.union([t.string, t.undefined, t.null]),
  clientIp: t.union([t.string, t.null, t.undefined]),
  interface: t.union([t.string, t.null, t.undefined]),
  userAgent: t.union([t.string, t.null, t.undefined]),
  userId: t.union([t.number, t.undefined, t.null]),
  createdAt: t.union([t.string, t.null, t.undefined]),
})

const ActionsTR = t.array(t.union([t.string, t.null]))

const AuditLogsListResponseTR = t.type({
  list: t.array(LogTR),
  types: t.array(t.union([t.string, t.null])),
  total: t.number,
  current: t.union([LogTR, t.undefined, t.null]),
  actions: t.union([ActionsTR, t.undefined]),
})


export type Log = t.TypeOf<typeof LogTR>
export type State = t.TypeOf<typeof AuditLogsListResponseTR>
export type Actions = t.TypeOf<typeof ActionsTR>

const defaultState: State = {
  list: [],
  total: 0,
  current: null,
  types: [],
  actions: [],
}

export const get = (state: RootState): State => _.get(state, ['auditLogs']) as State
export const getCurrent = (state: RootState): Log | null | undefined => _.get(state, ['auditLogs', 'current'])

export const FETCH = 'assessors/audit_log/FETCH'
export const FETCH_ACTIONS = 'assessors/audit_log/FETCH_ACTIONS'
export const FETCH_CURRENT = 'assessors/audit_log/FETCH_CURRENT'

export const fetch = (tableConfig: TableConfig): ApiAction<State> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: '/administration/audit_logs',
    debounce: 500,
    loader: true,
    tableConfig,
    typedResponse: AuditLogsListResponseTR,
  },
})

export const fetchActions = (type: string): ApiAction<Actions> => ({
  type: FETCH_ACTIONS,
  request: {
    method: 'get',
    url: '/administration/audit_logs/actions',
    debounce: 500,
    body: { type },
    typedResponse: ActionsTR,
  },
})

export const fetchCurrent = (id): ApiAction<Log> => ({
  type: FETCH_CURRENT,
  request: {
    method: 'get',
    url: `/administration/audit_logs/${id}`,
    typedResponse: LogTR,
  },
})

const HANDLERS = {
  [FETCH]: (state: State, { response }: ApiActionResponse<State>) => ({ ...state, ...response }),
  [FETCH_CURRENT]: (state: State, { response }: ApiActionResponse<State>) => setIn(state, 'current', response),
  [FETCH_ACTIONS]: (state: State, { response }: ApiActionResponse<Actions>) => setIn(state, 'actions', response),
}

export default createReducer(HANDLERS, defaultState)
