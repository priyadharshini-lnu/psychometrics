import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import _ from 'lodash'
import ApiAction from '~/interfaces/ApiAction'
import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'

export const FETCH = 'campaigns/current/FETCH'
export const UPDATE = 'campaigns/current/UPDATE'
export const FETCH_ASSESSMENTS_AND_REPORTS = 'campaigns/FETCH_ASSESSMENTS_AND_REPORTS'

export const UPDATE_CAMPAIGN = 'campaigns/current/UPDATE_CAMPAIGN'

export const get = (state: RootState) => _.get(state, ['current'])
export const getTenantId = (state: RootState) => get(state).tenantId

const defaultState = {
  permissions: {},
} as Campaign

export const fetch = (id: number, projectId: number) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${id}`,
  },
})

export const updatePermissions = (payload: Campaign) => ({
  type: UPDATE_CAMPAIGN,
  payload,
})

export const update = (id: number, projectId: number, body: Partial<Campaign>) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/projects/${projectId}/new_campaigns/${id}`,
    body: { resource: body },
  },
})

/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchAssessmentAndReports = (campaignId: string): ApiAction<any> => ({
  type: FETCH_ASSESSMENTS_AND_REPORTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/reports/assessments_and_reports`,
    loader: true,
  },
})

type FetchAction = ApiActionResponse<Campaign>

type UpdateType = ReturnType<typeof updatePermissions>

const HANDLERS = {
  [FETCH]: (state: Campaign, { response }: FetchAction) => ({ ...state, ...response }),
  [UPDATE]: (state: Campaign, { response }: FetchAction) => ({ ...state, ...response }),
  [UPDATE_CAMPAIGN]: (state: Campaign, { payload }: UpdateType) => ({
    ...state,
    ...payload,
  }),
}

export default createReducer(HANDLERS, defaultState)
