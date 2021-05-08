import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { RootState } from '../../../../core/rootReducers'

export const get = (state: RootState) => _.get(state, ['threeSixtyCampaign', 'campaignDetails'])
export const getCurrentCampaignId = (state: RootState) => get(state).id
export const getCurrentReportId = (state: RootState) => get(state).reportId
export const getCurrentCampaignName = (state: RootState) => get(state).name

interface State {
  id?: number
  reportId?: number
  name?: string
}

const defaultState: State = {}

export default createReducer({}, defaultState)
