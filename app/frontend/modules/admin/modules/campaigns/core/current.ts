import { createReducer } from 'utils/redux'
import Campaign from 'modules/admin/modules/campaigns/interfaces/Campaign'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'

export const FETCH = 'campaigns/current/FETCH'
export const UPDATE = 'campaigns/current/UPDATE'
export const FETCH_ASSESSMENTS_AND_REPORTS = 'campaigns/FETCH_ASSESSMENTS_AND_REPORTS'

const defaultState = {}

export const fetch = (id: number, projectId: number) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${id}`,
  },
})

export const update = (id: number, projectId: number, body: Partial<Campaign>) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/projects/${projectId}/new_campaigns/${id}`,
    body: { resource: body },
  },
})

export const fetchAssessmentAndReports = (campaignId: string) => ({
  type: FETCH_ASSESSMENTS_AND_REPORTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/reports/assessments_and_reports`,
  },
})

type FetchAction = ApiActionResponse<Campaign>

const HANDLERS = {
  [FETCH]: (state: Campaign, { response }: FetchAction) => ({ ...state, ...response }),
  [UPDATE]: (state: Campaign, { response }: FetchAction) => ({ ...state, ...response }),
}

export default createReducer(HANDLERS, defaultState)
