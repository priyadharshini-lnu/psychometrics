import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { setIn, updateIn } from '~/utils/immutable'

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

interface UserInfo {
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface AssessorAssessment {
  id: number
  assessment_id: number
  linked_assessment_id: number
  name: string
  status: string
  allow_multiple_responses: boolean
  completed_at: string
}
export interface State {
  userId: null | number
  userInfo: UserInfo,
  currentAssessorFormId: null | number
  currentAssessmentId?: null | number
  assessorAssessments: {
    [assesment_id:string | number]: AssessorAssessment[]
  }
  subjectAssessments: UserAssessment[]
  loaded: boolean
  assessorForms: {},
  subjectForms: {},
}

const defaultState: State = {
  userId: null,
  userInfo: {},
  currentAssessorFormId: null,
  currentAssessmentId: null,
  assessorAssessments: {},
  subjectAssessments: [],
  loaded: false,
  assessorForms: {},
  subjectForms: {},
}

const FETCH_ASSESSOR_ASSESSMENTS = 'assessors/evaluating/FETCH_ASSESSOR_ASSESSMENTS'
const FETCH_ASSESSOR_ASSESSMENT = 'assessors/evaluating/FETCH_ASSESSOR_ASSESSMENT'
const FETCH_SUBJECT_ASSESSMENT = 'assessors/evaluating/FETCH_SUBJECT_ASSESSMENT'
const CHANGE_ASSESSOR_FORM = 'assessors/evaluating/CHANGE_ASSESSOR_FORM'
const CHANGE_SUBJECT_ASSESSMENT = 'assessors/evaluating/CHANGE_SUBJECT_ASSESSMENT'
const UPDATE_ASSESSOR_ASSESSMENT_STATUS = 'assessors/evaluating/UPDATE_ASSESSOR_ASSESSMENT_STATUS'

type FetchAssessorAssessmentsType = ApiActionResponse<{
  user_info: {}
  assessor_assessments: {
    [assessment_id:number]:AssessorAssessment[]
  }
  subject_assessments: UserAssessment[]
}> & { requestAction: { userId?: number } }

// TODO: @fedor implement typedResponse and assessment/result type
type FetchType = ApiActionResponse<{
  assessment: AssessorAssessment,
  result: Result,
}>

type ChangeFormType = ReturnType<typeof changeAssessorForm>
type UpdateAssessorStatus = ReturnType<typeof updateAssessorAssessmentStatus>

export const changeAssessorForm = (id: number | null) => ({
  type: CHANGE_ASSESSOR_FORM,
  id,
})

export const changeSubjectAssessment = (id: number) => ({
  type: CHANGE_SUBJECT_ASSESSMENT,
  id,
})

export const fetchAssessorAssessments = (parsedCampaignId: number, userId: number) => ({
  type: FETCH_ASSESSOR_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${parsedCampaignId}/evaluations/${userId}/evaluate`,
    body: {},
    camelize: false,
  },
  userId,
})

export const fetchAssessorAssessment = (evaluationId: number, { edit, read, lang }) => ({
  type: FETCH_ASSESSOR_ASSESSMENT,
  request: {
    method: 'get',
    url: `/assessors/evaluations/${evaluationId}`,
    camelize: false,
    body: { edit, read, lang },
  },
  evaluationId,
})

export const fetchSubjectAssessment = (evaluationId: number) => ({
  type: FETCH_SUBJECT_ASSESSMENT,
  request: {
    method: 'get',
    url: `/assessors/evaluations/${evaluationId}/subject_assessment`,
    camelize: false,
  },
  evaluationId,
})

export const updateAssessorAssessmentStatus = (assessmentId: number, userAssessmentId: number) => ({
  type: UPDATE_ASSESSOR_ASSESSMENT_STATUS,
  assessmentId,
  userAssessmentId,
})

const HANDLERS = {
  [FETCH_ASSESSOR_ASSESSMENTS]: (state: State, {
    response, requestAction: { userId },
  }: FetchAssessorAssessmentsType) => ({
    ...state,
    userId: userId ?? null,
    userInfo: response.user_info,
    assessorAssessments: response.assessor_assessments,
    subjectAssessments: response.subject_assessments,
    currentAssessmentId: _.get(response, ['subject_assessments', 0, 'id']),
    loaded: true,
  }),
  [FETCH_ASSESSOR_ASSESSMENT]: (state: State, { response, requestAction: { evaluationId } }: FetchType) => ({
    ...state, assessorForms: { [evaluationId]: response },
  }),
  [FETCH_SUBJECT_ASSESSMENT]: (state: State, { response, requestAction: { evaluationId } }: FetchType) => setIn(
    state, ['subjectForms', evaluationId], response,
  ),
  [CHANGE_ASSESSOR_FORM]: (state: State, { id }: ChangeFormType) => ({
    ...state, currentAssessorFormId: id, assessorForms: {},
  }),
  [CHANGE_SUBJECT_ASSESSMENT]: (state: State, { id }: ChangeFormType) => ({
    ...state, currentAssessmentId: id,
  }),
  [UPDATE_ASSESSOR_ASSESSMENT_STATUS]: (state: State, { assessmentId, userAssessmentId }:
    UpdateAssessorStatus) => updateIn(
    state,
    ['assessorAssessments', assessmentId],
    assessments => assessments.map(
      assessment => (assessment.id === userAssessmentId ? { ...assessment, status: 'completed' } : assessment),
    ),
  ),
}

export const getAssessorForms = state => state.assessorForms
export const getAssessorForm = (state, id) => state.assessorForms[id]
export const getSubjectForm = (state, id) => state.subjectForms[id]
export const getCurrentAssessorForm = state => state.evaluation.currentAssessorFormId

export default createReducer(HANDLERS, defaultState)
