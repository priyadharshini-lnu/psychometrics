import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { CampaignOptions } from 'modules/admin/modules/campaigns/interfaces/Campaign'

export const FETCH = 'campaigns/campaignOptions/FETCH'
export const UPDATE = 'campaigns/campaignOptions/UPDATE'

const defaultState = {}

export const get = (state): CampaignOptions => _.get(state, ['campaigns', 'campaignOptions'])

export const fetch = (projectId: number, campaignId: number) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/fetch_campaign_options`,
  },
})

export const update = (projectId: number, campaignId: number, body: Partial<CampaignOptions>) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/update_campaign_options`,
    body: { resource: body },
  },
})

const HANDLERS = {
  [FETCH]: (state: CampaignOptions, { response }: { response: CampaignOptions }) => ({ ...response }),
  [UPDATE]: (state: CampaignOptions, { response }: { response: CampaignOptions }) => ({ ...response }),
}

export default createReducer(HANDLERS, defaultState)
