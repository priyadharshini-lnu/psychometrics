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

export const remove = (campaignId: string, campaignReportId: number, value: boolean) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/reports/${campaignReportId}`,
    body: {
      remove_user_reports: value,
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
}

export default createReducer(HANDLERS, defaultState)
