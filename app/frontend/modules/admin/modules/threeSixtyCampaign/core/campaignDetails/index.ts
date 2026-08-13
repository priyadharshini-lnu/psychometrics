import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { RootState } from '../../../../core/rootReducers'

const UPDATE_CAMPAIGN_DETAILS = 'threeSixty/campaignDetails/UPDATE_CAMPAIGN_DETAILS'

export const get = (state: RootState) => _.get(state, ['threeSixtyCampaign', 'campaignDetails'])
export const getCurrentCampaignId = (state: RootState) => get(state).id
export const getCurrentReportId = (state: RootState) => get(state).reportId
export const getCampaignReportPermissions = (state: RootState) => get(state).campaignReportPermissions
export const getAssessmentPermissions = (state: RootState) => get(state).campaignAssessmentPermissions
export const getCurrentAssessmentId = (state: RootState) => get(state).assessmentId
export const getCurrentDimensionId = (state: RootState) => get(state).dimensionId
export const getCurrentCampaignName = (state: RootState) => get(state).name
export const getCategory = (state: RootState) => get(state).category
export const getCampaignId = (state: RootState) => get(state).campaignId
export const getCampaignTenantId = (state: RootState) => get(state).tenantId
export const getReportAvailableLanguages = (state: RootState) => get(state).reportAvailableLanguages
export const getReportDefaultLanguage = (state: RootState) => get(state).reportDefaultLanguage
export const getReportName = (state: RootState) => get(state).reportName
export const getReportIcon = (state: RootState) => get(state).reportIcon


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
  tenantId?: number
  reportId?: number
  reportName?: string
  reportIcon?: string
  campaignReportPermissions?: CampaignReportPermissions,
  campaignAssessmentPermissions?: CampaignAssessmentPermissions
  assessmentId?: number
  dimensionId?: number
  name?: string
  reportAvailableLanguages?: string[]
  reportDefaultLanguage?: string
}

export const updateCampaignDetails = payload => ({
  type: UPDATE_CAMPAIGN_DETAILS,
  payload,
})

type UpdateType = ReturnType<typeof updateCampaignDetails>

const defaultState: State = {}

const HANDLERS = {
  [UPDATE_CAMPAIGN_DETAILS]: (state: State, { payload }: UpdateType) => ({
    ...state,
    ...payload,
  }),
}


export default createReducer(HANDLERS, defaultState)
