import _ from 'lodash'
import { takeLatest, put, select } from 'redux-saga/effects'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { setIn, updateIn } from 'utils/immutable'
import { getTables } from 'modules/admin/core/filterAndPagination/selectors'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { closeModal } from 'modules/admin/core/ui/modals'

const defaultState: State = {
  list: [],
  availableAssessments: [],
  form: {
    attrs: [],
    errors: null,
  },
  total: 0,
}

export const get = (state): State => _.get(state, ['campaigns', 'assessors'])
export const getCurrent = (state): AssessorDetails => _.get(get(state), ['current'])
export const getForm = state => _.get(get(state), ['form'])
export const getAvailableAssessments = state => _.get(get(state), ['availableAssessments'])

export const FETCH = 'campaigns/FETCH_ASSESSORS'
export const CREATE = 'resource/campaigns/assessor/CREATE'
export const UPDATE = 'resource/campaigns/assessor/UPDATE'
export const IMPORT = 'campaigns/assessors/IMPORT'
export const REMOVE = 'campaigns/assessor/REMOVE'
export const CREATE_ALL_ASSESSORS = 'campaigns/assessor/CREATE_ALL_ASSESSORS'
export const CREATE_ALL_ASSESSORS_FAILURE = 'campaigns/assessor/CREATE_ALL_ASSESSORS_FAILURE'
export const FILL_ASSESSORS = 'campaigns/assessor/FILL_ASSESSORS'
export const FETCH_AVAILABLE_ASSESSMENTS = 'campaigns/assessor/FETCH_AVAILABLE_ASSESSMENTS'
export const CLEAR_FORM = 'campaigns/assessor/CLEAR_FORM'

const AssessorTR = t.type({
  id: t.number,
  fullName: t.string,
  email: t.string,
  totalEvaluations: t.number,
  completedEvaluations: t.number,
  status: t.string,
})

type Assessor = t.TypeOf<typeof AssessorTR>

const FetchAssessorsTR = t.type({
  list: t.array(AssessorTR),
  total: t.number,
})

const AvailableAssessmentTR = t.type({
  name: t.string,
  id: t.number,
})

type AvailableAssessment = t.TypeOf<typeof AvailableAssessmentTR>

const FetchAvailableAssessmentsTR = t.array(AvailableAssessmentTR)


export const fetch = (campaignId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/new_campaigns/${campaignId}/assessors`,
    typedResponse: FetchAssessorsTR,
  },
})

export const fetchAvailableAssessments = (campaignId: string) => ({
  type: FETCH_AVAILABLE_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessors/available_assessments`,
    typedResponse: FetchAvailableAssessmentsTR,
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const importAssessors = (campaignId: number, body: any) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessors/import`,
    body,
    loader: true,
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

export interface AssessorDetails {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  status: string
  evaluationsComplete: number
}


export interface AssessorFormItem {
  assessorEmail?: string
  assessorFirstName?: string
  assessorLastName?: string
  subjectEmail?: string
  assessmentIds?: number[]
}
export interface Assessment {
  id: number
  name: string
}
export interface State {
  list: Assessor[]
  availableAssessments: Assessment[]
  form: {
    attrs: AssessorFormItem[]
    errors: unknown
  }
  total: number
}

type FetchType = ApiActionResponse<State>
type FetchAvailableAssessmentsType = ApiActionResponse<AvailableAssessment[]>
type CreateType = ApiActionResponse<Assessor>
type UpdateType = ApiActionResponse<Assessor>
type RemoveType = ApiActionResponse<number>

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchType) => ({ ...state, ...response }),
  [FETCH_AVAILABLE_ASSESSMENTS]: (state: State, { response }: FetchAvailableAssessmentsType) => (
    { ...state, availableAssessments: response }
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
