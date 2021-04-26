import _ from 'lodash'
import { Action } from 'redux'
import { createReducer } from 'utils/redux'
import Report from 'modules/admin/modules/campaigns/interfaces/Report'
import { updateIn } from 'utils/immutable'
import { RootState } from 'modules/admin/core/rootReducers'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'

const defaultState = {
  list: [],
  selectedIds: [],
  permissions: {
    toggleUserAccess: false,
    toggleAssessorAccess: false,
  },
}

export const get = (state): State => _.get(state, ['campaigns', 'reports'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')

export const CREATE = 'resource/campaigns/report/CREATE'
export const REMOVE = 'resource/campaigns/report/REMOVE'
export const TOGGLE_USER_ACCESS = 'resource/campaigns/report/TOGGLE_USER_ACCESS'
export const TOGGLE_ASSESSOR_ACCESS = 'campaigns/report/TOGGLE_ASSESSOR_ACCESS'
export const TOGGLE_ASSESSOR_ACCESS_REQUEST = 'campaigns/report/TOGGLE_ASSESSOR_ACCESS_REQUEST'
export const SELECT_RECORDS = 'campaigns/reports/SELECT_RECORDS'
export const REGENERATE_REPORTS = 'campaigns/reports/REGENERATE_REPORTS'
export const REMOVE_REPORT_BY_IDS = 'resource/campaigns/report/REMOVE_REPORT_BY_IDS'
export const BULK_DOWNLOAD = 'campaigns/reports/BULK_DOWNLOAD'

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

export const toggleAssessorAccess = (campaignId: number, id: number) => ({
  type: TOGGLE_ASSESSOR_ACCESS,
  id,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/reports/${id}/toggle_assessor_access`,
  },
})

export const selectRecords = (ids: number[]) => ({
  type: SELECT_RECORDS,
  payload: { ids },
})

type SelectRecordsType = ReturnType<typeof selectRecords>

export const regenerateReports = (campaignId: number, ids: number[]) => ({
  type: REGENERATE_REPORTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/reports/regenerate`,
    body: { ids },
    loader: true,
  },
})

export const bulkDownload = (campaignId: number, ids: number[]) => ({
  type: BULK_DOWNLOAD,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/reports/bulk_download`,
    body: { ids },
    loader: true,
  },
})

type RemoveResponse = number

type FetchType = ApiActionResponse<{reports: Report[], permissions: { reportPermissions: {} }}>
type CreateType = ApiActionResponse<{reports: Report[]}>
type ToggleUserAccessType = ApiActionResponse<Report>
type RemoveType = ApiActionResponse<RemoveResponse>
interface ToggleAssessorAccessType extends Action{
  id: number
}

export interface State {
  list: Report[],
  selectedIds: number[]
  permissions: {
    toggleUserAccess: boolean
    toggleAssessorAccess: boolean
  }
}

const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (state: State, { response }: FetchType) => (
    { ...state, list: response.reports, permissions: response.permissions.reportPermissions }
  ),
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
  [TOGGLE_ASSESSOR_ACCESS_REQUEST]: (state: State, { id }: ToggleAssessorAccessType) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => {
      if (report.id !== id) return report

      return { ...report, assessorAccess: !report.assessorAccess }
    }))
  ),
  [SELECT_RECORDS]: (state: State, { payload: { ids } }: SelectRecordsType) => ({ ...state, selectedIds: ids }),
}

export default createReducer(HANDLERS, defaultState)
