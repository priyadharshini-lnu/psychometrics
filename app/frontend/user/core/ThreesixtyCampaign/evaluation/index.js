import { takeLatest, put } from 'redux-saga/effects'
import { setIn } from 'utils/immutable'

const FETCH = 'threeSixty/evaluation/FETCH'
const FETCH_FAILURE = 'threeSixty/evaluation/FETCH_FAILURE'

const FETCH_ASSESSMENT = 'threeSixty/evaluation/FETCH_ASSESSMENT'
const UPDATE_STATUS = 'threeSixty/evaluation/UPDATE_STATUS'
const DENY_EVALUATION = 'threeSixty/evaluation/DENY_EVALUATION'

export const fetchAssessment = (campaignId, evaluationId, isEdit) => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/campaigns/${campaignId}/assessments`,
    camelize: false,
  },
  campaignId,
  evaluationId,
  isEdit,
})

export const fetchEvaluation = (campaignId, evaluationId, isEdit) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}`,
    camelize: false,
    body: { edit: isEdit },
  },
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

export const denyEvaluation = (campaignId, evaluationId) => ({
  type: DENY_EVALUATION,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}/deny`,
    method: 'put',
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
  [DENY_EVALUATION]: (state, action) => setIn(state,
    ['results', 'participant', 'evaluator_nomination_status'],
    action.response.evaluatorNominationStatus),
  [UPDATE_STATUS]: (state, action) => setIn(state,
    ['results', 'participant', 'approval_status'],
    action.response.managerNominationStatus),
}
export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genFetchEvaluation ({ requestAction: { campaignId, evaluationId, isEdit } }) {
  yield put(fetchEvaluation(campaignId, evaluationId, isEdit))
}

export const watchers = [
  takeLatest(FETCH_ASSESSMENT, genFetchEvaluation),
]
