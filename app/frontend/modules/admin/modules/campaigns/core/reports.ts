import _ from 'lodash'
import { createReducer } from 'utils/redux'
import Report from 'modules/admin/modules/campaigns/interfaces/Report'
import { updateIn } from 'utils/immutable'
import { RootState } from 'modules/admin/core/rootReducers'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'

const defaultState = {
  list: [],
  selectedIds: [],
}

export const get = (state): State => _.get(state, ['campaigns', 'reports'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')

export const CREATE = 'resource/campaigns/report/CREATE'
export const REMOVE = 'resource/campaigns/report/REMOVE'
export const TOGGLE_USER_ACCESS = 'resource/campaigns/report/TOGGLE_USER_ACCESS'
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

export const selectRecords = (ids: number[]) => ({
  type: SELECT_RECORDS,
  payload: { ids },
})

type SelectRecordsAction = ReturnType<typeof selectRecords>

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

export interface FetchAction {
  response: {
    reports: Report[],
  },
}

export interface State {
  list: Report[],
  selectedIds: number[]
}

const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (_, { response }: FetchAction) => ({ list: response.reports }),
  [CREATE]: (_, { response }: FetchAction) => ({ list: response.reports }),
  [REMOVE]: (state: State, { response }: { response: number }) => (
    updateIn(state, ['list'], (reports: Report[]) => _.filter(
      reports, (report: Report) => report.id !== response,
    ))
  ),
  [TOGGLE_USER_ACCESS]: (state: State, { response }: { response: Report }) => (
    updateIn(state, ['list'], (reports: Report[]) => _.map(reports, (report: Report) => {
      if (report.id === response.id) { return response }

      return report
    }))
  ),
  [SELECT_RECORDS]: (state: State, { payload: { ids } }: SelectRecordsAction) => ({ ...state, selectedIds: ids }),
}

export default createReducer(HANDLERS, defaultState)
