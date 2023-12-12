import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import _ from 'lodash'
import { createReducer } from '~/utils/redux'

export const UserAssessmentTR = t.type({
  id: t.number,
  name: t.string,
  assessment_id: t.number,
})

export type UserAssessment = t.TypeOf<typeof UserAssessmentTR>

export const ResultTR = t.type({
  id: t.number,
})

export type Result = t.TypeOf<typeof ResultTR>

export interface State {
  leadAssessorUserAssessmentId: null | number
  loaded: boolean
  leadAssessorForm: null | UserAssessment
  assessorForms: {[id: number]: UserAssessment}
  assessorAssessments: UserAssessment[]
  assessorResponses: {[id:number]: Result[]}
}

const defaultState: State = {
  leadAssessorUserAssessmentId: null,
  leadAssessorForm: null,
  assessorResponses: {},
  assessorForms: {},
  assessorAssessments: [],
  loaded: false,
}

const FETCH_LEAD_ASSESSMENT = 'assessors/evaluating/FETCH_LEAD_ASSESSMENT'
const FETCH_ASSESSOR_ASSESSMENTS = 'assessors/evaluating/FETCH_ASSESSOR_ASSESSMENTS'
const FETCH_ASSESSOR_ASSESSMENT = 'assessors/evaluating/FETCH_ASSESSOR_ASSESSMENT'

type FetchLeadAssessmentsType = ApiActionResponse<{
  lead_assessor_user_assessment_id: number
  lead_assessor_form: UserAssessment
  lead_assessor_result: Result
}>

type FetchAssessorAssessmentsType = ApiActionResponse<{
  assessor_assessments: UserAssessment[]
}>

// TODO: @fedor implement typedResponse and assessment/result type
type FetchType = ApiActionResponse<{
  assessment: UserAssessment
  results: Result[]
}>


export const fetchLeadAssessment = (parsedCampaignId: number, userId: number) => ({
  type: FETCH_LEAD_ASSESSMENT,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${parsedCampaignId}/score_moderations/${userId}`,
    body: {},
    camelize: false,
  },
})

export const fetchAssessorAssessments = (parsedCampaignId: number, userId: number) => ({
  type: FETCH_ASSESSOR_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${parsedCampaignId}/score_moderations/${userId}/assessor_assessments`,
    body: {},
    camelize: false,
  },
})

export const fetchAssessorAssessment = (parsedCampaignId: number, userId: number, assessmentId: number) => ({
  type: FETCH_ASSESSOR_ASSESSMENT,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${parsedCampaignId}/score_moderations/${userId}/assessment_with_results`,
    body: { assessmentId },
    camelize: false,
  },
  assessmentId,
})

const HANDLERS = {
  [FETCH_LEAD_ASSESSMENT]: (state: State, { response }: FetchLeadAssessmentsType) => ({
    ...state,
    leadAssessorUserAssessmentId: response.lead_assessor_user_assessment_id,
    leadAssessorForm: response.lead_assessor_form,
    leadAssessorResult: response.lead_assessor_result,
    loaded: true,
  }),
  [FETCH_ASSESSOR_ASSESSMENTS]: (state: State, { response }: FetchAssessorAssessmentsType) => ({
    ...state,
    assessorAssessments: response.assessor_assessments,
  }),
  [FETCH_ASSESSOR_ASSESSMENT]: (state: State, { response, requestAction: { assessmentId } }: FetchType) => ({
    ...state,
    assessorForms: { ...state.assessorForms, [assessmentId]: response.assessment },
    assessorResponses: { ...state.assessorResponses, [assessmentId]: response.results },
  }),
}

export const getLeadAssessorForm = state => state.leadAssessorForm
export const getLeadAssessorResult = state => state.leadAssessorResult
export const getAssessorForm = (state, id) => state.assessorForms[id]
export const getAssessorResults = (state, assessmentId) => _.get(
  state.assessorResponses, [assessmentId],
)
export const getCurrentAssessorForm = state => state.evaluation.currentAssessorFormId

export default createReducer(HANDLERS, defaultState)
