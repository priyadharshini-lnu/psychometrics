import _ from 'lodash'
import { createReducer } from 'utils/redux'
import Report from 'modules/admin/modules/campaigns/interfaces/Report'
import { updateIn } from 'utils/immutable'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'

const defaultState = {
  list: [],
  selectedId: [],
}

export const get = (state): State => _.get(state, ['campaigns', 'reports'])

export const CREATE = 'resource/campaigns/report/CREATE'
export const REMOVE = 'resource/campaigns/report/REMOVE'
export const TOGGLE_USER_ACCESS = 'resource/campaigns/report/TOGGLE_USER_ACCESS'

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


export interface FetchAction {
  response: {
    reports: Report[],
  },
}

export interface State {
  list: Report[]
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
}

export default createReducer(HANDLERS, defaultState)
