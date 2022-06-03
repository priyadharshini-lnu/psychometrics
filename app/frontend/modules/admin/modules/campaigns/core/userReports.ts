import _ from 'lodash'
import { createReducer, CustomAction } from 'utils/redux'
import { setIn, updateIn } from 'utils/immutable'
import UserReport from 'modules/admin/modules/campaigns/interfaces/UserReport'
import humps from 'humps'
import { RootState } from 'modules/admin/core/rootReducers'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { put, takeEvery } from 'redux-saga/effects'
import * as t from 'io-ts'
import { FETCH_SINGLE as FETCH_SINGLE_USER, CREATE_REPORT, REMOVE_REPORT } from './users'

const ModuleOverrideTR = t.type({
  id: t.number,
  moduleId: t.number,
  userReportId: t.number,
  approved: t.boolean,
  content: t.union([t.string, t.null]),
  editor: t.type({
    firstName: t.string,
    lastName: t.string,
  }),
  updatedAt: t.string,
})

export type ModuleOverride = t.TypeOf<typeof ModuleOverrideTR>
interface UserReportDetails {
  id?: number
  loaded?: boolean
  user: {
    id?: number
    email?: string
  }
  report: {
    default_language?: string,
    name?: string,
    locales?: object,
    loaded: boolean
    require_approval: boolean
  }
  options: {
    reports: {approval: {}}
  }
  results: object[],
  campaign?: object,
  moduleOverrides: ModuleOverride[]
  richEditorOpened: boolean
  approved: boolean
  campaignId?: number
}

export interface State {
  list: UserReport[],
  current: UserReportDetails,
  selectedIds: number[]
}

const defaultState: State = {
  list: [],
  selectedIds: [],
  current: {
    user: { },
    options: { reports: { approval: {} } },
    report: {
      loaded: false,
      require_approval: false,
    },
    results: [],
    moduleOverrides: [],
    approved: false,
    richEditorOpened: false,
  },
}

export const get = (state: RootState): State => state.campaigns.userReports
export const getCurrent = (state: RootState): UserReportDetails => _.get(get(state), ['current'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')

export const FETCH_SINGLE = 'campaigns/userReports/FETCH_SINGLE'
export const DOWNLOAD = 'campaigns/userReports/DOWNLOAD'
export const ASYNC_DOWNLOAD = 'campaigns/userReports/ASYNC_DOWNLOAD'
export const SELECT_RECORDS = 'campaigns/userReports/SELECT_RECORDS'
export const REGENERATE_REPORTS = 'campaigns/userReports/REGENERATE_REPORTS'
export const TOGGLE_USER_ACCESS = 'resource/campaigns/report/TOGGLE_USER_ACCESS'
export const TOGGLE_USER_ACCESS_REQUEST = 'resource/campaigns/report/TOGGLE_USER_ACCESS_REQUEST'
export const SET_USER_REPORTS = 'campaigns/userReports/SET_USER_REPORTS'
export const CREATE_MODULE_OVERRIDE = 'campaigns/userReports/CREATE_MODULE_OVERRIDE'
export const UPDATE_MODULE_OVERRIDE = 'campaigns/userReports/UPDATE_MODULE_OVERRIDE'
export const APPROVE_MODULE_OVERRIDE = 'campaigns/userReports/APPROVE_MODULE_OVERRIDE'
export const REMOVE_MODULE_OVERRIDE = 'campaigns/userReports/REMOVE_MODULE_OVERRIDE'
export const APPROVE_REPORT = 'campaigns/userReports/APPROVE_REPORT'
export const OPEN_RICH_EDITOR = 'report/OPEN_RICH_EDITOR'
export const CLOSE_RICH_EDITOR = 'report/CLOSE_RICH_EDITOR'

export const fetchSingle = (campaignId: number, id: number) => ({
  type: FETCH_SINGLE,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
    camelize: false,
  },
})

export const createTextOverride = (campaignId: number, body: {}) => ({
  type: CREATE_MODULE_OVERRIDE,
  request: {
    typedResponse: ModuleOverrideTR,
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/text_module_overrides`,
    body,
  },
})

export const updateTextOverride = (campaignId: number, id: number, body: {}) => ({
  type: UPDATE_MODULE_OVERRIDE,
  request: {
    typedResponse: ModuleOverrideTR,
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/text_module_overrides/${id}`,
    body,
  },
})

export const approveTextOverride = (campaignId: number, body: {}) => ({
  type: APPROVE_MODULE_OVERRIDE,
  request: {
    typedResponse: ModuleOverrideTR,
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/text_module_overrides/approve`,
    body,
  },
})

export const removeTextOverride = (campaignId: number, id: number, userReportId: number) => ({
  type: REMOVE_MODULE_OVERRIDE,
  id,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/text_module_overrides/${id}`,
    body: {
      userReportId,
    },
  },
})

export const approveReport = (campaignId?: number, id?: number) => ({
  type: APPROVE_REPORT,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/approve`,
  },
})

export const asyncDownload = (campaignId: number, id: number) => ({
  type: ASYNC_DOWNLOAD,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/download`,
  },
})

export const download = (campaignId: number, id: number) => ({
  type: DOWNLOAD,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/download.pdf`,
    responseType: 'blob',
    loader: true,
  },
})

export const selectRecords = (ids: number[]) => ({
  type: SELECT_RECORDS,
  payload: { ids },
})


export const regenerateReports = (campaignId: number, ids: number[]) => ({
  type: REGENERATE_REPORTS,
  ids,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_reports/regenerate`,
    body: { ids },
    loader: true,
  },
})

export const remove = (campaignId: number, id: number) => ({
  type: REMOVE_REPORT,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
  },
})

export const toggleUserAccess = (campaignId: number, id: number) => ({
  type: TOGGLE_USER_ACCESS,
  id,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/toggle_user_access`,
  },
})

export const setUserReports = (userReports: UserReport[]) => ({
  type: SET_USER_REPORTS,
  userReports,
})

export const CLEAR_USER_REPORT_DETAILS = 'campaigns/userReports/CLEAR_USER_REPORT_DETAILS'
export const clearUseReportDetails = () => ({ type: CLEAR_USER_REPORT_DETAILS })

type FetchType = ApiActionResponse<{userReports: UserReport[]}>
type FetchSingleType = ApiActionResponse<UserReportDetails>
type RegenerateReports = ApiActionResponse<{}>
type SelectRecordsType = ReturnType<typeof selectRecords>
type ToggleUserAccessType = ApiActionResponse<{id: number}>
type CreateModuleOverride = ApiActionResponse<ModuleOverride>
type ApproveModuleOverride = ApiActionResponse<ModuleOverride>
type RemoveModuleOverride = ApiActionResponse<{}>

const HANDLERS = {
  [FETCH_SINGLE]: (state: State, action: FetchSingleType) => ({
    ...state,
    current: {
      ...humps.camelizeKeys(action.response),
      results: action.response.results,
      report: action.response.report,
      user: action.response.user,
      loaded: true,
    },
  }),
  [SET_USER_REPORTS]: (state: State, { userReports }: CustomAction<{userReports: UserReport[]}>) => (
    { ...state, list: userReports }),
  [SELECT_RECORDS]: (state: State, { payload: { ids } }: SelectRecordsType) => ({ ...state, selectedIds: ids }),
  [REGENERATE_REPORTS]: (state: State, { requestAction: { ids } }: RegenerateReports) => (
    updateIn(state, ['list'],
      (userReports: UserReport[]) => userReports.map((userReport) => {
        if (_.includes(ids, userReport.id)) { return { ...userReport, status: 'generating' } }

        return userReport
      }))
  ),
  [TOGGLE_USER_ACCESS_REQUEST]: (state: State, { id }: ToggleUserAccessType) => (
    updateIn(state, ['list'], (userReports: UserReport[]) => _.map(userReports, (userReport: UserReport) => {
      if (userReport.id !== id) return userReport

      return { ...userReport, userAccess: !userReport.userAccess }
    }))
  ),
  [CLEAR_USER_REPORT_DETAILS]: (state: State) => ({ ...state, current: defaultState.current }),
  [CREATE_MODULE_OVERRIDE]: (state, { response }: CreateModuleOverride) => (
    setIn(state, ['current', 'moduleOverrides'], [...state.current.moduleOverrides, response])
  ),
  [APPROVE_MODULE_OVERRIDE]: (state, { response }: ApproveModuleOverride) => {
    const exists = _.find(state.current.moduleOverrides, { id: response.id })
    return setIn(setIn(state, ['current', 'moduleOverrides'], exists
      ? state.current.moduleOverrides.map(m => (m.id === response.id ? response : m))
      : [...state.current.moduleOverrides, response]), ['current', 'approved'], false)
  },
  [UPDATE_MODULE_OVERRIDE]: (state, { response }: ApproveModuleOverride) => (
    setIn(setIn(state, ['current', 'moduleOverrides'], state.current.moduleOverrides
      .map(m => (m.id === response.id ? response : m))), ['current', 'approved'], false)
  ),
  [REMOVE_MODULE_OVERRIDE]: (state, { requestAction }: RemoveModuleOverride) => (
    setIn(setIn(state, ['current', 'moduleOverrides'], state.current.moduleOverrides
      .filter(m => m.id !== requestAction.id)), ['current', 'approved'], false)
  ),
  [OPEN_RICH_EDITOR]: (state: State) => setIn(state, ['current', 'richEditorOpened'], true),
  [CLOSE_RICH_EDITOR]: (state: State) => setIn(state, ['current', 'richEditorOpened'], false),
  [APPROVE_REPORT]: (state: State) => setIn(state, ['current', 'approved'], true),
}

function* genSetUserReports ({ response }: FetchType) {
  yield put(setUserReports(response.userReports))
}

export const watchers = [
  takeEvery(
    [FETCH_SINGLE_USER, CREATE_REPORT, REMOVE_REPORT],
    genSetUserReports,
  ),
]

export default createReducer(HANDLERS, defaultState)
