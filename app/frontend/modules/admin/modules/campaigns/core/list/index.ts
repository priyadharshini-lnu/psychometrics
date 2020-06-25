import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'

export interface Campaign {
  id: number
  name: string
  type: string
  assessments: Entity[]
  reports: Entity[]
}

export interface Entity {
  name: string
  iconColor: string
  iconUrl: string
}

const defaultState = []

export const get = (state): Campaign[] => _.get(state, ['campaigns', 'list'])

export const FETCH = 'campaigns/FETCH_CAMPAIGNS'
export const CREATE = 'resource/campaign/CREATE'
export const UPDATE = 'resource/campaign/UPDATE'
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

export const fetchTemplatesAndAssessments = projectId => ({
  type: FETCH_TEMPLATES_AND_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/templates_and_assessment`,
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
}

export default createReducer(HANDLERS, defaultState)
