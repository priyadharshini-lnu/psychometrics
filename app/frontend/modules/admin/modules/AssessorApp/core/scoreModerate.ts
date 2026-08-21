import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import {
  CampaignFactorOutputType,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'

export const UserAssessmentTR = t.type({
  id: t.number,
  name: t.string,
  assessment_id: t.number,
})

export const CampaignFactorTR = t.type({
  id: t.string,
  name: t.string,
  outputType: t.keyof(CampaignFactorOutputType),
})

export const CampaignFactorGroupTR = t.type({
  id: t.string,
  name: t.string,
  campaignFactors: t.array(CampaignFactorTR),
})

export type CampaignFactor = t.TypeOf<typeof CampaignFactorTR>
export type CampaignFactorGroup = t.TypeOf<typeof CampaignFactorGroupTR>

export const campaignFactorGroupSchema = {
  type: 'campaign_factor_groups',
  relationships: {
    campaignFactors: {
      type: 'campaign_factors',
    },
  },
}

export const UserReportTR = t.type({
  id: t.number,
  project_id: t.number,
  campaign_id: t.number,
  report_id: t.number,
  name: t.string,
  poster: t.string,
  external_report: t.boolean,
})

export const UserRecordingTR = t.type({
  id: t.number,
  externalId: t.string,
  recordingDate: t.string,
  recordingUrl: t.union([t.string, t.null]),
  assessmentCenterDateAndTime: t.union([t.string, t.null]),
  assessors: t.array(
    t.type({
      id: t.union([t.string, t.number]),
      email: t.string,
    }),
  ),
  participants: t.array(
    t.type({
      id: t.union([t.string, t.number]),
      email: t.string,
    }),
  ),
  transcriptionUrl: t.union([t.string, t.null]),
  transcriptionText: t.union([t.string, t.null]),
  disableTranscriptDownload: t.boolean,
  hideParticipantVideo: t.boolean,
})

export type UserRecording = t.TypeOf<typeof UserRecordingTR>
export type UserAssessment = t.TypeOf<typeof UserAssessmentTR>
export type UserReport = t.TypeOf<typeof UserReportTR>

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
  userReports: null | UserReport[]
  mainReportId: null | number
  assessorResponses: {[id:number]: Result[]}
  canModerateScore: boolean,
  userRecordings: null | UserRecording[];
}

const defaultState: State = {
  leadAssessorUserAssessmentId: null,
  leadAssessorForm: null,
  assessorResponses: {},
  assessorForms: {},
  assessorAssessments: [],
  userReports: null,
  mainReportId: null,
  loaded: false,
  canModerateScore: false,
  userRecordings: [],
}

const FETCH_LEAD_ASSESSMENT = 'assessors/evaluating/FETCH_LEAD_ASSESSMENT'
const FETCH_ASSESSOR_ASSESSMENTS = 'assessors/evaluating/FETCH_ASSESSOR_ASSESSMENTS'
const FETCH_ASSESSOR_ASSESSMENT = 'assessors/evaluating/FETCH_ASSESSOR_ASSESSMENT'
export const FETCH_RECORDINGS = 'assessors/evaluating/FETCH_RECORDINGS'
export const FETCH_REPORTS = 'assessors/evaluating/FETCH_REPORTS'

export type FetchLeadAssessmentsType = ApiActionResponse<{
  lead_assessor_user_assessment_id: number
  lead_assessor_form: UserAssessment
  lead_assessor_result: Result
  assessor_can_moderate_scores: boolean
}>

type FetchAssessorAssessmentsType = ApiActionResponse<{
  assessor_assessments: UserAssessment[]
}>

type FetchReportsType = ApiActionResponse<{
  reports: UserReport[]
  mainReportId: number
}>

// TODO: @fedor implement typedResponse and assessment/result type
type FetchType = ApiActionResponse<{
  assessment: UserAssessment
  results: Result[]
}>

type FetchRecordingsType = ApiActionResponse<{
  userRecordings: UserRecording[]
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

export const fetchReports = (parsedCampaignId: number, userId: number) => ({
  type: FETCH_REPORTS,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${parsedCampaignId}/score_moderations/${userId}/reports`,
    body: {},
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

export const fetchRecordings = (parsedCampaignId: number, userId: number) => ({
  type: FETCH_RECORDINGS,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${parsedCampaignId}/score_moderations/${userId}/recordings`,
    body: {},
  },
})

const HANDLERS = {
  [FETCH_LEAD_ASSESSMENT]: (state: State, { response }: FetchLeadAssessmentsType) => ({
    ...state,
    leadAssessorUserAssessmentId: response.lead_assessor_user_assessment_id,
    leadAssessorForm: response.lead_assessor_form,
    leadAssessorResult: response.lead_assessor_result,
    canModerateScore: response.assessor_can_moderate_scores,
    loaded: true,
  }),
  [FETCH_ASSESSOR_ASSESSMENTS]: (state: State, { response }: FetchAssessorAssessmentsType) => ({
    ...state,
    assessorAssessments: response.assessor_assessments,
  }),
  [FETCH_REPORTS]: (state: State, { response }: FetchReportsType) => ({
    ...state,
    userReports: response.reports,
    mainReportId: response.mainReportId,
  }),
  [FETCH_ASSESSOR_ASSESSMENT]: (state: State, { response, requestAction: { assessmentId } }: FetchType) => ({
    ...state,
    assessorForms: { ...state.assessorForms, [assessmentId]: response.assessment },
    assessorResponses: { ...state.assessorResponses, [assessmentId]: response.results },
  }),
  [FETCH_RECORDINGS]: (state: State, { response }: FetchRecordingsType) => ({
    ...state,
    userRecordings: response.userRecordings,
  }),
}

export const assessorCanModerateScore = state => state.canModerateScore
export const getLeadAssessorForm = state => state.leadAssessorForm
export const getLeadAssessorResult = state => state.leadAssessorResult
export const getAssessorForm = (state, id) => state.assessorForms[id]
export const getAssessorResults = (state, assessmentId) => _.get(
  state.assessorResponses, [assessmentId],
)
export const getCurrentAssessorForm = state => state.evaluation.currentAssessorFormId
export const getRecordings = state => state.userRecordings

export default createReducer(HANDLERS, defaultState)
