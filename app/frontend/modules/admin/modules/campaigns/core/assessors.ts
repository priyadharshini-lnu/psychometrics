import _ from 'lodash'
import { takeLatest, put, select } from 'redux-saga/effects'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { getTables } from '~/modules/admin/core/filterAndPagination/selectors'
import { closeModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import { setIn, updateIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'

const defaultState: State = {
  list: [],
  current: null,
  availableAssessments: [],
  leadAssessorAssessment: null,
  form: {
    attrs: [],
    errors: null,
  },
  total: 0,
  permissions: {
    import: false,
    export: false,
    add: false,
  },
}

export const get = (state: RootState): State => _.get(state, ['campaigns', 'assessors'])
export const getCurrent = (state: RootState) => _.get(get(state), ['current'])
export const getForm = (state: RootState) => _.get(get(state), ['form'])
export const getAvailableAssessments = (state: RootState) => _.get(get(state), ['availableAssessments'])
export const getLeadAssessorAssessment = (state: RootState) => _.get(get(state), ['leadAssessorAssessment'])

export const FETCH = 'campaigns/FETCH_ASSESSORS'
export const CREATE = 'resource/campaigns/assessor/CREATE'
export const UPDATE = 'resource/campaigns/assessor/UPDATE'
export const IMPORT = 'campaigns/assessors/IMPORT'
export const REMOVE = 'campaigns/assessor/REMOVE'
export const CREATE_ALL_ASSESSORS = 'campaigns/assessor/CREATE_ALL_ASSESSORS'
export const CREATE_ALL_ASSESSORS_FAILURE = 'campaigns/assessor/CREATE_ALL_ASSESSORS_FAILURE'
export const FILL_ASSESSORS = 'campaigns/assessor/FILL_ASSESSORS'
export const FETCH_AVAILABLE_ASSESSMENTS = 'campaigns/assessor/FETCH_AVAILABLE_ASSESSMENTS'
export const FETCH_LEAD_ASSESSOR_ASSESSMENT = 'campaigns/assessor/FETCH_LEAD_ASSESSOR_ASSESSMENT'
export const CLEAR_FORM = 'campaigns/assessor/CLEAR_FORM'
export const FETCH_SINGLE = 'campaigns/assessor/FETCH_SINGLE'

const AssessorTR = t.type({
  id: t.number,
  fullName: t.string,
  email: t.string,
  totalEvaluations: t.number,
  completedEvaluations: t.number,
  workshopAssessorsCount: t.number,
  status: t.string,
  permissions: t.type({
    remove: t.boolean,
    loginAs: t.boolean,
  }),
})

type Assessor = t.TypeOf<typeof AssessorTR>

const FetchAssessorsTR = t.type({
  list: t.array(AssessorTR),
  permissions: t.type({
    import: t.boolean,
    export: t.boolean,
    add: t.boolean,
  }),
  total: t.number,
})

const AvailableAssessmentTR = t.type({
  name: t.string,
  id: t.number,
})

type AvailableAssessment = t.TypeOf<typeof AvailableAssessmentTR>

const FetchAvailableAssessmentsTR = t.array(AvailableAssessmentTR)

const SingleAssessorTR = t.type({
  id: t.number,
  email: t.string,
  fullName: t.string,
  permissions: t.type({
    addSubject: t.boolean,
    removeSubject: t.boolean,
  }),
})
export type SingleAssessor = t.TypeOf<typeof SingleAssessorTR>

export const fetchSingle = (campaignId: number, assessorId: number): ApiAction<SingleAssessor> => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessors/${assessorId}`,
    typedResponse: SingleAssessorTR,
  },
})

export const fetch = (campaignId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/new_campaigns/${campaignId}/assessors`,
    typedResponse: FetchAssessorsTR,
    loader: true,
  },
})

export const fetchAvailableAssessments = (campaignId: string | number) => ({
  type: FETCH_AVAILABLE_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessors/available_assessments`,
    typedResponse: FetchAvailableAssessmentsTR,
  },
})

export const fetchLeadAssessorAssessment = (campaignId: string | number) => ({
  type: FETCH_LEAD_ASSESSOR_ASSESSMENT,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessors/lead_assessor_assessment`,
  },
})

export const importAssessors = (campaignId: number, body: FormData) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessors/import`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

export const createAllAssessors = (campaignId: string, assessors: AssessorFormItem[]) => ({
  type: CREATE_ALL_ASSESSORS,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessors/create_all`,
    body: { assessors },
    loader: true,
  },
})

export const fillAssessors = (assessors: AssessorFormItem[]) => ({ type: FILL_ASSESSORS, assessors })
export const clearForm = () => ({ type: CLEAR_FORM })

const RemoveTR = t.number

export const remove = (campaignId: string, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/assessors/${id}`,
    typedResponse: RemoveTR,
  },
})

export interface AssessorFormItem {
  assessorEmail?: string
  assessorFirstName?: string
  assessorLastName?: string
  subjectEmail?: string
  assessmentIds?: number[]
  leadAssessmentId?: number
}
export interface Assessment {
  id: number
  name: string
}
export interface State {
  list: Assessor[]
  current: SingleAssessor | null
  availableAssessments: Assessment[]
  leadAssessorAssessment: Assessment | null
  form: {
    attrs: AssessorFormItem[]
    errors: null | { [key: string]: string[] }
  }
  total: number
  permissions: {
    import: boolean
    export: boolean
    add: boolean
  }
}

type FetchType = ApiActionResponse<State>
type FetchAvailableAssessmentsType = ApiActionResponse<AvailableAssessment[]>
type FetchLeadAssessorAssessmentType = ApiActionResponse<AvailableAssessment>
type CreateType = ApiActionResponse<Assessor>
type UpdateType = ApiActionResponse<Assessor>
type RemoveType = ApiActionResponse<number>
type FetchSingleType = ApiActionResponse<SingleAssessor>

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchType) => ({ ...state, ...response }),
  [FETCH_SINGLE]: (state: State, { response }: FetchSingleType) => ({ ...state, current: response }),
  [FETCH_AVAILABLE_ASSESSMENTS]: (state: State, { response }: FetchAvailableAssessmentsType) => (
    { ...state, availableAssessments: response }
  ),
  [FETCH_LEAD_ASSESSOR_ASSESSMENT]: (state: State, { response }: FetchLeadAssessorAssessmentType) => (
    { ...state, leadAssessorAssessment: response }
  ),
  [CREATE]: (state: State, { response }: CreateType) => (setIn(state, ['list'], [response, ...state.list])),
  [FILL_ASSESSORS]: (state: State, { assessors }: CreateType) => (setIn(state, ['form', 'attrs'], assessors)),
  [UPDATE]: (state: State, { response }: UpdateType) => (
    updateIn(state, ['list'], (assessors: Assessor[]) => _.map(assessors, (assessor: Assessor) => {
      if (assessor.id === response.id) { return response }

      return assessor
    }))
  ),
  [CLEAR_FORM]: (state: State) => ({ ...state, form: defaultState.form }),
  [CREATE_ALL_ASSESSORS_FAILURE]: (state: State, { errors }: CreateType) => (setIn(state, ['form', 'errors'], errors)),
  [REMOVE]: (state: State, { response }: RemoveType) => (
    updateIn(state, ['list'], (assessors: Assessor[]) => _.filter(
      assessors, (assessor: Assessor) => assessor.id !== response,
    ))
  ),
}

interface FetchAssessorsRequest {
  type: string
  requestAction: ReturnType<typeof createAllAssessors>
}

export default createReducer(HANDLERS, defaultState)

export function* genFetchAssessors ({ requestAction }: FetchAssessorsRequest) {
  const tables = yield select(getTables)
  yield put(fetch(requestAction.campaignId, tables.assessorsList))
}

function* genClearForm () {
  yield put(clearForm())
}
function* genCloseModal () {
  yield put(closeModal())
}

export const watchers = [
  takeLatest(CREATE_ALL_ASSESSORS, genFetchAssessors),
  takeLatest(CREATE_ALL_ASSESSORS, genClearForm),
  takeLatest(CREATE_ALL_ASSESSORS, genCloseModal),
]
