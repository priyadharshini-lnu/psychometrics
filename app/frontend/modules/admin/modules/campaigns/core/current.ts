import { createReducer } from 'utils/redux'
import Campaign from 'modules/admin/modules/campaigns/interfaces/Campaign'

export const FETCH = 'campaigns/current/FETCH'
export const UPDATE = 'campaigns/current/UPDATE'

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

export interface FetchAction {
  response: Campaign
}


const HANDLERS = {
  [FETCH]: (state: Campaign, { response }: FetchAction) => ({ ...state, ...response }),
  [UPDATE]: (state: Campaign, { response }: FetchAction) => ({ ...state, ...response }),
}

export default createReducer(HANDLERS, defaultState)
