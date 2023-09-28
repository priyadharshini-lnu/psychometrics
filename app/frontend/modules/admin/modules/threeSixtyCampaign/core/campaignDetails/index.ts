import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { RootState } from '../../../../core/rootReducers'

export const get = (state: RootState) => _.get(state, ['threeSixtyCampaign', 'campaignDetails'])
export const getCurrentCampaignId = (state: RootState) => get(state).id
export const getCurrentReportId = (state: RootState) => get(state).reportId
export const getCampaignReportPermissions = (state: RootState) => get(state).campaignReportPermissions
export const getAssessmentPermissions = (state: RootState) => get(state).campaignAssessmentPermissions
export const getCurrentAssessmentId = (state: RootState) => get(state).assessmentId
export const getCurrentDimensionId = (state: RootState) => get(state).dimensionId
export const getCurrentCampaignName = (state: RootState) => get(state).name
export const getCampaignId = (state: RootState) => get(state).campaignId

type CampaignReportPermissions = {
  editSubjectReport: boolean,
  manageReportsOptions: boolean,
}

type CampaignAssessmentPermissions = {
  editAssessment: boolean,
}
interface State {
  id?: number
  campaignId?: number
  reportId?: number
  campaignReportPermissions?: CampaignReportPermissions,
  campaignAssessmentPermissions?: CampaignAssessmentPermissions
  assessmentId?: number
  dimensionId?: number
  name?: string
}

const defaultState: State = {}

export default createReducer({}, defaultState)
