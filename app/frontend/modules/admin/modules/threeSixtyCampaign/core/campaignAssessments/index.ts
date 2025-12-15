import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { RootState } from '../../../../core/rootReducers'

const UPDATE_CAMPAIGN_ASSESSMENT_DETAILS = 'threeSixty/campaignDetails/UPDATE_CAMPAIGN_ASSESSMENT_DETAILS'

export const get = (state: RootState) => _.get(state, ['threeSixtyCampaign', 'campaignAssessments'])

interface State {
  id?: number
  campaignId?: number
  cachingEnabled?: boolean
  allowCaching? :boolean
}

export const updateCampaignAssessmentDetails = payload => ({
  type: UPDATE_CAMPAIGN_ASSESSMENT_DETAILS,
  payload,
})

type UpdateType = ReturnType<typeof updateCampaignAssessmentDetails>

const defaultState: State = {}

const HANDLERS = {
  [UPDATE_CAMPAIGN_ASSESSMENT_DETAILS]: (state: State, { payload }: UpdateType) => ({
    ...state,
    ...payload,
  }),
}


export default createReducer(HANDLERS, defaultState)
