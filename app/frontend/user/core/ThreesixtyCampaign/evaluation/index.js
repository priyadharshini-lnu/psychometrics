import { takeLatest, put } from 'redux-saga/effects'
import { setIn } from 'utils/immutable'

const FETCH = 'threeSixty/evaluation/FETCH'
const FETCH_FAILURE = 'threeSixty/evaluation/FETCH_FAILURE'
const CLEAR_EVALAUTION = 'threeSixty/evaluation/CLEAR_EVALAUTION'

const FETCH_ASSESSMENT = 'threeSixty/evaluation/FETCH_ASSESSMENT'
const UPDATE_STATUS = 'threeSixty/evaluation/UPDATE_STATUS'

export const fetchAssessment = (campaignId, evaluationId, { isEdit, step }) => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/campaigns/${campaignId}/assessments`,
    camelize: false,
  },
  campaignId,
  evaluationId,
  isEdit,
  step,
})

export const fetchEvaluation = (campaignId, evaluationId, body) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}`,
    camelize: false,
    body,
  },
})

export const clearEvalaution = () => ({
  type: CLEAR_EVALAUTION,
})

export const updateStatus = (campaignId, evaluationId, status) => ({
  type: UPDATE_STATUS,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}/update_status`,
    method: 'put',
    body: {
      status,
    },
  },
})


export const defaultState = {
  results: {
    subject: {},
    participant: {},
  },
  assessment: null,
  loaded: false,
  error: false,
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, results: action.response, loaded: true }),
  [FETCH_FAILURE]: state => ({ ...state, loaded: true, error: true }),
  [FETCH_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.response }),
  [CLEAR_EVALAUTION]: () => defaultState,
  [UPDATE_STATUS]: (state, action) => setIn(state,
    ['results', 'participant', 'manager_evaluation_status'],
    action.response.managerEvaluationStatus),
}
export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genFetchEvaluation ({ requestAction: { campaignId, evaluationId, isEdit, step } }) {
  yield put(fetchEvaluation(campaignId, evaluationId, { isEdit, step }))
}

export const watchers = [
  takeLatest(FETCH_ASSESSMENT, genFetchEvaluation),
]
