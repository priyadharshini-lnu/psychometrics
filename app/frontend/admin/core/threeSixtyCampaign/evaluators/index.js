import { takeLatest, put } from 'redux-saga/effects'
import { setIn } from 'utils/immutable'
import { closeModal } from 'admin/core/temp/modals'

export const CLEAR_FORM = 'threeSixty/evaluators/CLEAR_FORM'
export const CREATE_ALL_EVALUATORS = 'threeSixty/evaluators/CREATE_ALL_EVALUATORS'
export const CREATE_ALL_EVALUATORS_FAILURE = 'threeSixty/evaluators/CREATE_ALL_EVALUATORS_FAILURE'
const FILL_EVALUATORS = 'threeSixty/evaluators/FILL_EVALUATORS'
const FETCH_EVALUATORS = 'threeSixty/evaluators/FETCH_EVALUATORS'
export const IMPORT = 'threeSixty/evaluators/IMPORT'

export const defaultState = {
  list: [],
  total: 0,
  form: {
    attrs: [],
    errors: null,
  },
}
export const createAllEvaluators = (campaignId, evaluators) => ({
  type: CREATE_ALL_EVALUATORS,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators/create_all`,
    body: { evaluators },
    loader: true,
  },
})

export const fillEvaluators = evaluators => ({ type: FILL_EVALUATORS, evaluators })
export const clearForm = () => ({ type: CLEAR_FORM })

export const fetchEvaluators = (campaignId, page, q) => ({
  type: FETCH_EVALUATORS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators`,
    body: {
      page,
      q,
    },
  },
})

export const importFile = (campaignId, data) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators/import`,
    body: data,
    loader: true,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_EVALUATORS:
      return { ...state, list: action.response.evaluators, total: action.response.total }
    case FILL_EVALUATORS:
      return setIn(state, ['form', 'attrs'], action.evaluators)
    case CLEAR_FORM:
      return { ...state, form: defaultState.form }
    case CREATE_ALL_EVALUATORS_FAILURE:
      return setIn(state, ['form', 'errors'], action.errors)
    default:
      return state
  }
}

export function* genFetchEvaluators ({ requestAction }) {
  yield put(fetchEvaluators(requestAction.campaignId))
}

function* genClearForm () {
  yield put(clearForm({}))
}
function* genCloseModal () {
  yield put(closeModal())
}

export const watchers = [
  takeLatest(CREATE_ALL_EVALUATORS, genFetchEvaluators),
  takeLatest(CREATE_ALL_EVALUATORS, genClearForm),
  takeLatest(CREATE_ALL_EVALUATORS, genCloseModal),
  takeLatest(IMPORT, genFetchEvaluators),
  takeLatest(IMPORT, genCloseModal),
]
