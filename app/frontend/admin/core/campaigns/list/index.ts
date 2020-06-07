import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import { TableConfig } from 'admin/filterAndPagination/interfaces'

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

export const FETCH_CAMPAIGNS = 'campaigns/FETCH_CAMPAIGNS'

export const fetch = (projectId: string, tableConfig: TableConfig) => ({
  type: FETCH_CAMPAIGNS,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/projects/${projectId}/new_campaigns`,
  },
})

export interface FetchAction {
  response: {
    total: number
    campaigns: Campaign[]
  }
}

const HANDLERS = {
  [FETCH_CAMPAIGNS]: (_, { response }: FetchAction) => response.campaigns,
}

export default createReducer(HANDLERS, defaultState)
