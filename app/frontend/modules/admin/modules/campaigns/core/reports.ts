import _ from 'lodash'
import * as t from 'io-ts'
import { Action } from 'redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import ApiAction from 'interfaces/ApiAction'
import Report from '~/modules/admin/modules/campaigns/interfaces/Report'
import { OtherReport, OtherReportTR } from '~/modules/admin/modules/campaigns/interfaces/OtherReport'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { updateIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'

const defaultState = {
  list: [],
  other: {
    list: [],
    total: 0,
  },
  selectedIds: [],
  reportPermissions: {
    toggleUserAccess: false,
    toggleAssessorAccess: false,
    toggleAutoAssign: false,
    toggleUserDashboard: false,
    addReport: false,
    bulkDownload: false,
    regenerate: false,
  },
}

export const get = (state): State => _.get(state, ['campaigns', 'reports'])
export const getOther = (state): State['other'] => _.get(state, ['campaigns', 'reports', 'other'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')
export const CREATE = 'resource/campaigns/report/CREATE'
export const REMOVE = 'resource/campaigns/report/REMOVE'
export const TOGGLE_USER_ACCESS = 'resource/campaigns/report/TOGGLE_USER_ACCESS'
export const TOGGLE_USER_DASHBOARD = 'resource/campaigns/report/TOGGLE_USER_DASHBOARD'
export const TOGGLE_MAIN_REPORT = 'resource/campaigns/report/TOGGLE_MAIN_REPORT'
export const TOGGLE_ASSESSOR_ACCESS = 'campaigns/report/TOGGLE_ASSESSOR_ACCESS'
export const TOGGLE_AUTO_ASSIGN = 'campaigns/report/TOGGLE_AUTO_ASSIGN'
export const TOGGLE_ASSESSOR_ACCESS_REQUEST = 'campaigns/report/TOGGLE_ASSESSOR_ACCESS_REQUEST'
export const TOGGLE_AUTO_ASSIGN_REQUEST = 'campaigns/report/TOGGLE_AUTO_ASSIGN_REQUEST'
export const SELECT_RECORDS = 'campaigns/reports/SELECT_RECORDS'
export const REGENERATE_REPORTS = 'campaigns/reports/REGENERATE_REPORTS'
export const REMOVE_REPORT_BY_IDS = 'resource/campaigns/report/REMOVE_REPORT_BY_IDS'
export const BULK_DOWNLOAD = 'campaigns/reports/BULK_DOWNLOAD'
export const EXPORT_DATA = 'campaigns/reports/EXPORT_DATA'
export const FETCH_OTHER_REPORTS = 'campaigns/FETCH_OTHER_REPORTS'
export const UPDATE_DEFAULT_AND_AVAILABLE_LOCALES = 'campaigns/reports/UPDATE_DEFAULT_AND_AVAILABLE_LOCALES'


export const remove = (campaignId: number, campaignReportId: number, removeUserReports: boolean) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}`,
    body: {
      remove_user_reports: removeUserReports,
    },
  },
})

export const toggleUserAccess = (campaignId: number, campaignReportId: number, toggleUserAccess: boolean) => ({
  type: TOGGLE_USER_ACCESS,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}/toggle_user_access`,
    body: {
      toggle_user_access: toggleUserAccess,
    },
  },
})

export const toggleUserDashboard = (campaignId: number, campaignReportId: number) => ({
  type: TOGGLE_USER_DASHBOARD,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}/toggle_user_dashboard`,
  },
})

export const toggleMainReport = (campaignId: number, campaignReportId: number, value: boolean) => ({
  type: TOGGLE_MAIN_REPORT,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}/toggle_main_report`,
    body: {
      mainReport: value,
    },
  },
})

export const toggleAssessorAccess = (campaignId: number, id: number) => ({
  type: TOGGLE_ASSESSOR_ACCESS,
  id,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/reports/${id}/toggle_assessor_access`,
  },
})

export const toggleAutoAssign = (campaignId: number, id: number) => ({
  type: TOGGLE_AUTO_ASSIGN,
  id,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/reports/${id}/toggle_auto_assign`,
  },
})

export const selectRecords = (ids: number[]) => ({
  type: SELECT_RECORDS,
  payload: { ids },
})

type SelectRecordsType = ReturnType<typeof selectRecords>

export const regenerateReports = (campaignId: number, data:
{selectedReports: { [key: string]: string[] }, ids: number[]}) => ({
  type: REGENERATE_REPORTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/reports/regenerate`,
    body: { data },
    loader: true,
  },
})

export const bulkDownload = (
  campaignId: number,
  selectedReports: { [key: string]: string[] },
  ids: number[],
  startDate: Date,
  endDate: Date,
  includeInactiveUsers = false,
) => ({
  type: BULK_DOWNLOAD,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/reports/bulk_download`,
    body: {
      ids,
      selectedReports,
      startDate,
      endDate,
      includeInactiveUsers,
    },
    loader: true,
  },
})


export const exportData = (campaignId: number, reportId: number) => ({
  type: EXPORT_DATA,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/reports/${reportId}/export`,
  },
})

export const updateDefaultAndAvailableLocales = (
  campaignId: string, campaignReportId: string, body: { defaultLanguage: string, availableLanguages: string[] },
) => ({
  type: UPDATE_DEFAULT_AND_AVAILABLE_LOCALES,
  id: parseInt(campaignReportId, 10),
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}/update_default_and_available_locales`,
    body,
  },
})

type RemoveResponse = number

type FetchType = ApiActionResponse<{
  reports: Report[], otherReports: OtherReport[], permissions: {
    reportPermissions: {},
  }
}>
type CreateType = ApiActionResponse<{ reports: Report[] }>
type ToggleUserAccessType = ApiActionResponse<Report>
type RemoveType = ApiActionResponse<RemoveResponse>
type UpdateDefaultAndAvailableLocalesType = ApiActionResponse<{
  defaultLanguage: string, availableLanguages: string[],
}>
interface ToggleAssessorAccessType extends Action {
  id: number
}
interface ToggleAutoAssignType extends Action {
  id: number
}

export interface State {
  list: Report[],
  other: { list: OtherReport[], total: number },
  selectedIds: number[]
  reportPermissions: {
    toggleUserAccess: boolean
    toggleAssessorAccess: boolean
    toggleAutoAssign: boolean
    toggleUserDashboard: boolean
    toggleMainReport: boolean
    addReport: boolean
    bulkDownload: boolean
    regenerate: boolean
  }
}

const FetchOtherReporsResponseTR = t.type({
  total: t.number,
  list: t.array(OtherReportTR),
})

type FetcOtherReportsResponse = t.TypeOf<typeof FetchOtherReporsResponseTR>
export type FetchOtherReportsAction = ApiActionResponse<FetcOtherReportsResponse>

export const fetchOtherReports = (
  campaignId: string, tableConfig?: TableConfig,
): ApiAction<FetcOtherReportsResponse> => ({
  type: FETCH_OTHER_REPORTS,
  request: {
    tableConfig,
    typedResponse: FetchOtherReporsResponseTR,
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/reports/other`,
  },
})


const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (state: State, { response }: FetchType) => (
    {
      ...state,
      list: response.reports,
      reportPermissions: response.permissions.reportPermissions,
    }
  ),
  [FETCH_OTHER_REPORTS]: (state: State, { response }: FetchOtherReportsAction) => ({ ...state, other: response }),
  [CREATE]: (state: State, { response }: CreateType) => ({ ...state, list: response.reports }),
  [REMOVE]: (state: State, { response }: RemoveType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.filter(
      reports, (report: Report) => report.id !== response,
    ))
  ),
  [TOGGLE_USER_ACCESS]: (state: State, { response }: ToggleUserAccessType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => {
      if (report.id === response.id) { return response }

      return report
    }))
  ),
  [TOGGLE_USER_DASHBOARD]: (state: State, { response }: ToggleUserAccessType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => (
      report.id === response.id ? response : { ...report, userDashboard: false }
    )))
  ),
  [TOGGLE_MAIN_REPORT]: (state: State, { response }: ToggleUserAccessType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => (
      report.id === response.id ? response : { ...report, mainReport: false }
    )))
  ),
  [TOGGLE_ASSESSOR_ACCESS_REQUEST]: (state: State, { id }: ToggleAssessorAccessType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => {
      if (report.id !== id) return report

      return { ...report, assessorAccess: !report.assessorAccess }
    }))
  ),
  [TOGGLE_AUTO_ASSIGN_REQUEST]: (state: State, { id }: ToggleAutoAssignType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => {
      if (report.id !== id) return report

      return { ...report, autoAssign: !report.autoAssign }
    }))
  ),
  [UPDATE_DEFAULT_AND_AVAILABLE_LOCALES]: (state: State, {
    requestAction: { id },
    response,
  }: UpdateDefaultAndAvailableLocalesType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => {
      if (report.id !== id) return report
      const { defaultLanguage, availableLanguages } = response
      return { ...report, defaultLanguage, availableLanguages }
    }))
  ),
  [SELECT_RECORDS]: (state: State, { payload: { ids } }: SelectRecordsType) => ({ ...state, selectedIds: ids }),
}

export default createReducer(HANDLERS, defaultState)
