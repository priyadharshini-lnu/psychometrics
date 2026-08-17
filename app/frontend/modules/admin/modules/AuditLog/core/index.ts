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

const AuditHistoryEntryTR = t.type({
  id: t.number,
  version: t.union([t.number, t.null]),
  action: t.string,
  auditableType: t.string,
  auditableId: t.union([t.number, t.string]),
  auditableName: t.union([t.string, t.null, t.undefined]),
  createdAt: t.union([t.string, t.null, t.undefined]),
  requestUuid: t.union([t.string, t.null, t.undefined]),
  auditLogId: t.union([t.number, t.null, t.undefined]),
  user: t.union([
    t.type({
      fullName: t.string,
      email: t.string,
    }),
    t.undefined,
    t.null,
  ]),
  auditedChanges: t.any,
})

const RecordHistoryResponseTR = t.type({
  list: t.array(AuditHistoryEntryTR),
  total: t.number,
  types: t.union([t.array(t.union([t.string, t.null])), t.undefined]),
  fields: t.union([t.array(t.union([t.string, t.null])), t.undefined]),
})

export const RECORD_HISTORY_SEARCH_URL = '/api/v2/administration/record_change_histories/search'
export const TENANT_REPAIR_PREVIEW_URL = '/api/v2/administration/tenant_repairs/preview'
export const TENANT_REPAIR_UPDATE_TENANT_URL = '/api/v2/administration/tenant_repairs/update_tenant'
export const TENANT_REPAIR_SEARCH_MODELS_URL = '/api/v2/administration/tenant_repairs/search_models'

export const RecordHistorySearchStatusTR = t.type({
  status: t.string,
  response: t.type({
    asyncRequestUuid: t.string,
    processingStatus: t.string,
    responseType: t.string,
    responseData: t.union([RecordHistoryResponseTR, t.type({}), t.string, t.null]),
  }),
})

export type RecordHistorySearchStatus = t.TypeOf<typeof RecordHistorySearchStatusTR>

const AuditableTypesTR = t.array(t.string)

const AuditLogsListResponseTR = t.type({
  list: t.array(LogTR),
  types: t.array(t.union([t.string, t.null])),
  total: t.number,
  current: t.union([LogTR, t.undefined, t.null]),
  actions: t.union([ActionsTR, t.undefined]),
})


export type Log = t.TypeOf<typeof LogTR>
export type AuditLogsListResponse = t.TypeOf<typeof AuditLogsListResponseTR>
export type AuditHistoryEntry = t.TypeOf<typeof AuditHistoryEntryTR>
export type RecordHistoryResponse = t.TypeOf<typeof RecordHistoryResponseTR>
export type Actions = t.TypeOf<typeof ActionsTR>

type RecordHistoryState = {
  recordHistory: AuditHistoryEntry[]
  recordHistoryTotal: number
  recordHistoryTypes: string[]
  recordHistoryFields: string[]
  recordRevision: Record<string, unknown>
  auditableTypes: string[]
}

export type State = t.TypeOf<typeof AuditLogsListResponseTR> & RecordHistoryState

const defaultState: State = {
  list: [],
  total: 0,
  current: null,
  types: [],
  actions: [],
  recordHistory: [],
  recordHistoryTotal: 0,
  recordHistoryTypes: [],
  recordHistoryFields: [],
  recordRevision: {},
  auditableTypes: [],
}

export const get = (state: RootState): State => _.get(state, ['auditLogs']) as State
export const getCurrent = (state: RootState): Log | null | undefined => _.get(state, ['auditLogs', 'current'])
export const getRecordHistory = (state: RootState): AuditHistoryEntry[] => (
  _.get(state, ['auditLogs', 'recordHistory'], [])
)
export const getRecordHistoryTotal = (state: RootState): number => _.get(state, ['auditLogs', 'recordHistoryTotal'], 0)
export const getRecordHistoryTypes = (state: RootState): string[] => (
  _.get(state, ['auditLogs', 'recordHistoryTypes'], [])
)
export const getRecordHistoryFields = (state: RootState): string[] => (
  _.get(state, ['auditLogs', 'recordHistoryFields'], [])
)
export const getRecordRevision = (state: RootState): Record<string, unknown> => (
  _.get(state, ['auditLogs', 'recordRevision'], {})
)
export const getAuditableTypes = (state: RootState): string[] => _.get(state, ['auditLogs', 'auditableTypes'], [])

export const FETCH = 'assessors/audit_log/FETCH'
export const FETCH_ACTIONS = 'assessors/audit_log/FETCH_ACTIONS'
export const FETCH_CURRENT = 'assessors/audit_log/FETCH_CURRENT'

export const fetch = (tableConfig: TableConfig): ApiAction<AuditLogsListResponse> => ({
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

export const SCHEDULE_EXPORT = 'assessors/audit_log/SCHEDULE_EXPORT'

export const scheduleExport = (filters: Record<string, unknown>): ApiAction<{ message: string }> => ({
  type: SCHEDULE_EXPORT,
  request: {
    method: 'post',
    url: '/administration/audit_logs/schedule_export',
    body: { filters },
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

export const SET_RECORD_HISTORY = 'assessors/audit_log/SET_RECORD_HISTORY'
export const FETCH_AUDITABLE_TYPES = 'assessors/audit_log/FETCH_AUDITABLE_TYPES'

export const recordHistorySearchBody = (
  params: {
    recordType?: string
    recordId?: string
    requestUuid?: string
    page?: number
    size?: number
    startDate?: string
    endDate?: string
    associatedRecord?: boolean
    auditableType?: string
    changedField?: string
  },
) => ({
  record_type: params.recordType,
  record_id: params.recordId,
  request_uuid: params.requestUuid,
  page: params.page,
  size: params.size,
  start_date: params.startDate,
  end_date: params.endDate,
  associated_record: params.associatedRecord,
  auditable_type: params.auditableType,
  changed_field: params.changedField,
})

export const setRecordHistory = (response: RecordHistoryResponse) => ({
  type: SET_RECORD_HISTORY,
  response,
})

export const fetchAuditableTypes = (): ApiAction<string[]> => ({
  type: FETCH_AUDITABLE_TYPES,
  request: {
    method: 'get',
    url: '/api/v2/administration/record_change_histories/auditable_types',
    typedResponse: AuditableTypesTR,
  },
})

export const EXPORT_RECORD_HISTORY = 'assessors/audit_log/EXPORT_RECORD_HISTORY'

export const exportRecordHistory = (
  params: {
    recordType: string
    recordId: string
    startDate?: string
    endDate?: string
    associatedRecord?: boolean
    auditableType?: string
    changedField?: string
  },
): ApiAction<{ message: string }> => ({
  type: EXPORT_RECORD_HISTORY,
  request: {
    method: 'post',
    url: '/api/v2/administration/record_change_histories/export',
    body: {
      record_type: params.recordType,
      record_id: params.recordId,
      start_date: params.startDate,
      end_date: params.endDate,
      associated_record: params.associatedRecord,
      auditable_type: params.auditableType,
      changed_field: params.changedField,
    },
  },
})

export const FETCH_REVISION = 'assessors/audit_log/FETCH_REVISION'

export const fetchRevision = (
  params: { recordType: string; recordId: string; version: number },
): ApiAction<{ attributes: Record<string, unknown> }> => ({
  type: FETCH_REVISION,
  request: {
    method: 'get',
    url: '/api/v2/administration/record_change_histories/revision',
    body: {
      record_type: params.recordType,
      record_id: params.recordId,
      version: params.version,
    },
  },
})

const HANDLERS = {
  [FETCH]: (state: State, { response }: ApiActionResponse<State>) => ({ ...state, ...response }),
  [FETCH_CURRENT]: (state: State, { response }: ApiActionResponse<State>) => setIn(state, 'current', response),
  [FETCH_ACTIONS]: (state: State, { response }: ApiActionResponse<Actions>) => setIn(state, 'actions', response),
  [SCHEDULE_EXPORT]: (state: State) => state,
  [SET_RECORD_HISTORY]: (state: State, { response }: ApiActionResponse<RecordHistoryResponse>) => ({
    ...state,
    recordHistory: response.list,
    recordHistoryTotal: response.total,
    recordHistoryTypes: (response.types || []).filter((type): type is string => Boolean(type)),
    recordHistoryFields: (response.fields || []).filter((field): field is string => Boolean(field)),
  }),
  [FETCH_AUDITABLE_TYPES]: (state: State, { response }: ApiActionResponse<string[]>) => (
    setIn(state, 'auditableTypes', response)
  ),
  [EXPORT_RECORD_HISTORY]: (state: State) => state,
  [FETCH_REVISION]: (state: State, { response }: ApiActionResponse<{ attributes: Record<string, unknown> }>) => (
    setIn(state, 'recordRevision', response?.attributes || {})
  ),
}

export default createReducer(HANDLERS, defaultState)
