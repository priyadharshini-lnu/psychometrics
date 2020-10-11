import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { put, select, takeEvery } from 'redux-saga/effects'
import { AnyAction } from 'redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import Campaign from 'modules/admin/modules/campaigns/interfaces/Campaign'
import ApiAction from 'interfaces/ApiAction'
import * as t from 'io-ts'
import { getTables } from 'modules/admin/core/filterAndPagination/selectors'

const defaultState = []

export const get = (state): Campaign[] => _.get(state, ['campaigns', 'list'])

export const FETCH = 'campaigns/FETCH_CAMPAIGNS'
export const CREATE = 'resource/campaign/CREATE'
export const UPDATE = 'resource/campaign/UPDATE'
export const REMOVE = 'resource/campaign/REMOVE'
export const FETCH_TEMPLATES_AND_ASSESSMENTS = 'campaigns/FETCH_TEMPLATES_AND_ASSESSMENTS'

export const fetch = (projectId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/projects/${projectId}/new_campaigns`,
  },
})

const CampaignTemplate = t.type({
  id: t.number,
  name: t.string,
  assessmentId: t.number,
})
export type CampaignTemplate = t.TypeOf<typeof CampaignTemplate>

const Assessment = t.type({
  id: t.number,
  name: t.string,
})
export type Assessment = t.TypeOf<typeof Assessment>

const TemplateAndAssessment = t.type({
  templates: t.array(CampaignTemplate),
  assessments: t.array(Assessment),
})
export type TemplateAndAssessment = t.TypeOf<typeof TemplateAndAssessment>

export const fetchTemplatesAndAssessments = (projectId): ApiAction<TemplateAndAssessment> => ({
  type: FETCH_TEMPLATES_AND_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/templates_and_assessment`,
    typedResponse: TemplateAndAssessment,
  },
})

export const remove = (campaignId: number, projectId: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}`,
  },
})

export interface FetchAction {
  response: {
    total: number
    campaigns: Campaign[]
  }
}


const HANDLERS = {
  [FETCH]: (_, { response }: FetchAction) => response.campaigns,
  [CREATE]: (state: Campaign[], { response }: { response: Campaign }) => ([response, ...state]),
  [UPDATE]: (state: Campaign[], { response }: { response: Campaign }) => (
    _.map(state, (campaign: Campaign) => {
      if (campaign.id === response.id) { return response }

      return campaign
    })
  ),

  [REMOVE]: (state: Campaign[], { response }: { response: number }) => (
    state.filter(campaign => campaign.id !== response)
  ),
}

export default createReducer(HANDLERS, defaultState)

function* genFetchCampaigns ({ response }: AnyAction) {
  const tables = yield select(getTables)
  yield put(fetch(response.projectId, tables.campaignList))
}

export const watchers = [
  takeEvery(UPDATE, genFetchCampaigns),
]
