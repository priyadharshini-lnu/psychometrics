import _ from 'lodash'

export const get = state => _.get(state, ['threeSixtyCampaign', 'campaignDetails'])
export const getCurrentCampaignId = state => get(state).id
export const getCurrentReportId = state => get(state).reportId
export const getCurrentCampaignName = state => get(state).name

const defaultState = {}
export default function reducer (state = defaultState) {
  return state
}
