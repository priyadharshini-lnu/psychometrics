import { takeLatest, put } from 'redux-saga/effects'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import _ from 'lodash'
import { closeModal } from '~/modules/admin/core/ui/modals'
import { createReducer } from '~/utils/redux'
import { setIn } from '~/utils/immutable'

export const CLEAR_FORM = 'threeSixty/evaluators/CLEAR_FORM'
export const CREATE_ALL_EVALUATORS = 'threeSixty/evaluators/CREATE_ALL_EVALUATORS'
export const CREATE_ALL_EVALUATORS_FAILURE = 'threeSixty/evaluators/CREATE_ALL_EVALUATORS_FAILURE'
const FILL_EVALUATORS = 'threeSixty/evaluators/FILL_EVALUATORS'
const FETCH_EVALUATORS = 'threeSixty/evaluators/FETCH_EVALUATORS'
export const IMPORT = 'threeSixty/evaluators/IMPORT'

export const get = state => _.get(state, ['threeSixtyCampaign', 'evaluators'])
export const getForm = state => _.get(get(state), ['form'])

interface Evaluator {
  id: number
}

interface Permissions {
  addSubject: boolean
  editDimension: boolean
  editUser: boolean
  exportCompletionStatus: boolean
  exportResults: boolean
  manageDatasheets: boolean
  manageRelationships: boolean
  resetAllNominations: boolean
  resetAllParticipants: boolean
}

interface State {
  list: Evaluator[],
  total: number,
  permissions: Permissions,
  form: {
    attrs: [],
    errors: [] | null,
  },
}


export const defaultState: State = {
  list: [],
  total: 0,
  permissions: {
    addSubject: false,
    editDimension: false,
    editUser: false,
    exportCompletionStatus: false,
    exportResults: false,
    manageDatasheets: false,
    manageRelationships: false,
    resetAllNominations: false,
    resetAllParticipants: false,
  },
  form: {
    attrs: [],
    errors: null,
  },
}

export const createAllEvaluators = (campaignId: number, evaluators: Evaluator[]) => ({
  type: CREATE_ALL_EVALUATORS,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators/create_all`,
    body: { evaluators },
    loader: true,
  },
})

export const fillEvaluators = (evaluators: Evaluator[]) => ({ type: FILL_EVALUATORS, evaluators })
export const clearForm = () => ({ type: CLEAR_FORM })

export const fetchEvaluators = (campaignId: number, page?: number, q?: string) => ({
  type: FETCH_EVALUATORS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators`,
    body: {
      page,
      q,
    },
  },
})

export const importFile = (campaignId: number, data: FormData) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators/import`,
    body: data,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

interface FetchActionResponse {
  evaluators: Evaluator[],
  total: number,
  permissions: Permissions,
}

export type FetchAction = ApiActionResponse<FetchActionResponse>
export type CreateAllEvaluatorsAction = ApiActionResponse<typeof createAllEvaluators>
export type CreateAllEvaluatorsActionError = ApiActionResponse<{errors: []}>

const HANDLERS = {
  [FETCH_EVALUATORS]: (state: State, action: FetchAction) => ({
    ...state,
    list: action.response.evaluators,
    total: action.response.total,
    permissions: action.response.permissions,
  }),
  [FILL_EVALUATORS]: (state: State, action) => setIn(state, ['form', 'attrs'], action.evaluators),
  [CLEAR_FORM]: (state: State) => ({ ...state, form: defaultState.form }),
  [CREATE_ALL_EVALUATORS_FAILURE]: (state: State, action: CreateAllEvaluatorsActionError) => setIn(
    state, ['form', 'errors'], action.errors,
  ),
}

export default createReducer(HANDLERS, defaultState)

export function* genFetchEvaluators ({ requestAction }: CreateAllEvaluatorsAction) {
  yield put(fetchEvaluators(requestAction.campaignId))
}

function* genClearForm () {
  yield put(clearForm())
}
function* genCloseModal () {
  yield put(closeModal())
}

export const watchers = [
  takeLatest(CREATE_ALL_EVALUATORS, genFetchEvaluators),
  takeLatest(CREATE_ALL_EVALUATORS, genClearForm),
  takeLatest(CREATE_ALL_EVALUATORS, genCloseModal),
  takeLatest(IMPORT, genFetchEvaluators),
]
