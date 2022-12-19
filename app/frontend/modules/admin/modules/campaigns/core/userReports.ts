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

export interface Comment {
  id: string
  text: string,
  createdAt: string
  parentId: string
  moduleId: string
  resolved: boolean
  creator: {
    avatarUrl: string
    fullName: string
  }
  reportsModule: {id: string}
  parent: {id: string}
}

export const CommentSchema = {
  type: 'user_report_comments',
  relationships: {
    parent: {
      type: 'user_report_comments',
    },
    reportsModule: {
      type: 'modules',
    },
  },
}

export type ModuleOverride = t.TypeOf<typeof ModuleOverrideTR>

export enum ApprovalStatuses {
  NotRead = 'not_ready',
  PendingQC = 'pending_qc',
  QCInProgress = 'qc_in_progress',
  QCCompleted = 'qc_completed',
  ChangeRequested = 'change_requested',
  Approved = 'approved'
}

interface UserReportDetails {
  id?: number
  loaded?: boolean
  approvalStatus: ApprovalStatuses
  user: {
    id?: number
    email?: string
  }
  report: {
    default_language?: string,
    name?: string,
    locales?: object,
    loaded: boolean
  }
  options: {
    reports: {approval: {}}
  }
  requireApproval: boolean
  results: object[],
  campaign?: object,
  moduleOverrides: ModuleOverride[]
  comments: Comment[]
  richEditorOpened: boolean
  campaignId?: number
  permissions: {
    download: boolean
    manageQc: boolean
    manageApproval: boolean
  }
}

export interface State {
  list: UserReport[],
  externalReport: ExternalReportDetails,
  current: UserReportDetails,
  selectedIds: number[]
  selectedModule: null | number,
}

const defaultState: State = {
  list: [],
  selectedIds: [],
  externalReport: {} as ExternalReportDetails,
  current: {
    approvalStatus: ApprovalStatuses.NotRead,
    user: { },
    options: { reports: { approval: {} } },
    report: {
      loaded: false,
    },
    requireApproval: false,
    results: [],
    moduleOverrides: [],
    comments: [],
    richEditorOpened: false,
    permissions: {
      download: false,
      manageQc: false,
      manageApproval: false,
    },
  },
  selectedModule: null,
}

interface Module {
  id: number
  props: {
    text: string
  }
}

export const get = (state: RootState): State => state.campaigns.userReports
export const getCurrent = (state: RootState): UserReportDetails => _.get(get(state), ['current'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')

export const getCommentThreads = (state: RootState) => (
  _.get(get(state), ['current', 'comments']).filter((c => !c.parentId)).reverse()
)

export const getModules = (state: RootState):Module[] => (
  _.flatten(_.get(get(state), ['current', 'report', 'pages']).map(p => p.modules))
)

export const getSelectedModule = (state: RootState): Module | null => {
  const id = _.get(get(state), ['selectedModule'])
  return getModules(state).find(m => m.id === id) || null
}


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
export const START_QC = 'campaigns/userReports/START_QC'
export const ABORT_QC = 'campaigns/userReports/ABORT_QC'
export const SEND_TO_APPROVE = 'campaigns/userReports/SEND_TO_APPROVE'
export const REQUEST_CHANGES = 'campaigns/userReports/REQUEST_CHANGES'
export const REMOVE_APPROVAL = 'campaigns/userReports/REMOVE_APPROVAL'
export const SELECT_MODULE = 'campaigns/userReports/SELECT_MODULE'
export const NEW_COMMENT = 'campaigns/userReports/NEW_COMMENT'
export const UPDATE_COMMENT = 'campaigns/userReports/UPDATE_COMMENT'
export const READ_COMMENT = 'campaigns/userReports/READ_COMMENT'

export const selectModule = (id: number) => ({ type: SELECT_MODULE, id })

export const fetchSingle = (campaignId: number, id: number, params = {}) => ({
  type: FETCH_SINGLE,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
    camelize: false,
    body: params,
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

export const startQC = (campaignId?: number, id?: number) => ({
  type: START_QC,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/start_qc`,
  },
})


export const sendToReview = (campaignId?: number, id?: number) => ({
  type: SEND_TO_APPROVE,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/send_for_approval`,
  },
})

export const abortQC = (campaignId?: number, id?: number) => ({
  type: ABORT_QC,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/abort_qc`,
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

export const requestChanges = (campaignId?: number, id?: number) => ({
  type: REQUEST_CHANGES,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/request_changes`,
  },
})

export const removeApproval = (campaignId?: number, id?: number) => ({
  type: REMOVE_APPROVAL,
  id,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/remove_approval`,
  },
})

export const asyncDownload = (campaignId: number, id: number) => ({
  type: ASYNC_DOWNLOAD,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/download`,
  },
})

export const download = (campaignId: number, id: number, params = {}) => ({
  type: DOWNLOAD,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/download.pdf`,
    responseType: 'blob',
    loader: true,
    body: params,
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

export const readComment = (id: string) => ({
  type: READ_COMMENT,
  id,
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
type StartQC = ApiActionResponse<{status: string}>
type AbortQC = ApiActionResponse<{status: string}>
type ApproveReport = ApiActionResponse<{status: string}>
type RequestChanges = ApiActionResponse<{status: string}>
type SendToApprove = ApiActionResponse<{status: string}>
type RemoveApproval = ApiActionResponse<{status: string}>

const ExternalReportDetailsTR = t.type({
  id: t.number,
  userId: t.number,
  reportName: t.string,
  userEmail: t.string,
  pdfUrl: t.string,
  canDownloadReport: t.boolean,
})
type ExternalReportDetails = t.TypeOf<typeof ExternalReportDetailsTR>
export const getExternalReport = (state: RootState) => _.get(get(state), ['externalReport'])
type FetchExternalReportDetailsType = ApiActionResponse<ExternalReportDetails>
export const FETCH_EXTERNAL_REPORT_DETAILS = 'campaigns/userReports/FETCH_EXTERNAL_REPORT_DETAILS'
export const fetchExternalReportDetails = (campaignId: number, id: number) => ({
  type: FETCH_EXTERNAL_REPORT_DETAILS,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
    responseType: ExternalReportDetailsTR,
  },
})


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
  [FETCH_EXTERNAL_REPORT_DETAILS]: (state: State, action: FetchExternalReportDetailsType) => ({
    ...state,
    externalReport: action.response,
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
  [NEW_COMMENT]: (state, { data: { comment } }: RemoveModuleOverride) => (
    setIn(state, ['current', 'comments'], [...state.current.comments, { ...comment, isNew: true }])
  ),
  [UPDATE_COMMENT]: (state, { data: { comment } }: RemoveModuleOverride) => (
    setIn(state, ['current', 'comments'], state.current.comments.map(
      c => (c.id === comment.id ? { ...comment, isNew: true } : c),
    ))
  ),
  [READ_COMMENT]: (state, { id }: RemoveModuleOverride) => (
    setIn(state, ['current', 'comments'], state.current.comments.map(
      c => (c.id === id ? _.omit(c, 'isNew') : c),
    ))
  ),
  [OPEN_RICH_EDITOR]: (state: State) => setIn(state, ['current', 'richEditorOpened'], true),
  [CLOSE_RICH_EDITOR]: (state: State) => setIn(state, ['current', 'richEditorOpened'], false),
  [APPROVE_REPORT]: (state: State) => setIn(state, ['current', 'approved'], true),
  [START_QC]: (state: State, { response }: StartQC) => setIn(state, ['current', 'approvalStatus'], response.status),
  [ABORT_QC]: (state: State, { response }: AbortQC) => setIn(state, ['current', 'approvalStatus'], response.status),
  [APPROVE_REPORT]: (state: State, { response }: ApproveReport) => setIn(
    state, ['current', 'approvalStatus'], response.status,
  ),
  [SEND_TO_APPROVE]: (state: State, { response }: SendToApprove) => setIn(
    state, ['current', 'approvalStatus'], response.status,
  ),
  [REQUEST_CHANGES]: (state: State, { response }: RequestChanges) => setIn(
    state, ['current', 'approvalStatus'], response.status,
  ),
  [REMOVE_APPROVAL]: (state: State, { response }: RemoveApproval) => setIn(
    state, ['current', 'approvalStatus'], response.status,
  ),
  [SELECT_MODULE]: (state: State, { id }: ReturnType<typeof selectModule>) => setIn(
    state, ['selectedModule'], id,
  ),
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
