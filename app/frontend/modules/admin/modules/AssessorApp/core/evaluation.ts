import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import _ from 'lodash'
import { setIn } from 'utils/immutable'

export const UserAssessmentTR = t.type({
  id: t.number,
})

export type UserAssessment = t.TypeOf<typeof UserAssessmentTR>

export const ResultTR = t.type({
  id: t.number,
})

export type Result = t.TypeOf<typeof ResultTR>

export interface State {
  userInfo: {},
  currentAssessorFormId: null | number
  currentAssessmentId: null | number
  assessorAssessments: UserAssessment[]
  subjectAssessments: UserAssessment[]
  loaded: boolean
  assessorForms: {},
  subjectForms: {},
}

const defaultState: State = {
  userInfo: {},
  currentAssessorFormId: null,
  currentAssessmentId: null,
  assessorAssessments: [],
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

type FetchAssessorAssessmentsType = ApiActionResponse<{
  userInfo: {}
  assessorAssessments: UserAssessment[]
  subjectAssessments: UserAssessment[]
}>

// TODO: @fedor implement typedResponse and assessment/result type
type FetchType = ApiActionResponse<{
  assessment: UserAssessment,
  result: Result,
}>

type ChangeFormType = ReturnType<typeof changeAssessorForm>

export const changeAssessorForm = (id: number) => ({
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
  },
})

export const fetchAssessorAssessment = (evaluationId: number, edit: boolean) => ({
  type: FETCH_ASSESSOR_ASSESSMENT,
  request: {
    method: 'get',
    url: `/assessors/evaluations/${evaluationId}`,
    camelize: false,
    body: { edit },
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

const HANDLERS = {
  [FETCH_ASSESSOR_ASSESSMENTS]: (state: State, { response }: FetchAssessorAssessmentsType) => ({
    ...state,
    ...response,
    currentAssessmentId: _.get(response, ['subjectAssessments', 0, 'id']),
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
}

export const getAssessorForm = (state, id) => state.assessorForms[id]
export const getSubjectForm = (state, id) => state.subjectForms[id]
export const getCurrentAssessorForm = state => state.evaluation.currentAssessorFormId

export default createReducer(HANDLERS, defaultState)
