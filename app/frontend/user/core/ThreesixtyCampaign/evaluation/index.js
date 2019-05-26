import { takeLatest, put } from 'redux-saga/effects'

const FETCH = 'threeSixty/evaluation/FETCH'
const FETCH_ASSESSMENT = 'threeSixty/evaluation/FETCH_ASSESSMENT'
const UPDATE_STATUS = 'threeSixty/evaluation/UPDATE_STATUS'

export const fetchAssessment = (campaignId, evaluationId) => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/campaigns/${campaignId}/assessments`,
    camelize: false,
  },
  campaignId,
  evaluationId,
})

export const fetchEvaluation = (campaignId, evaluationId) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}`,
    camelize: false,
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

export const defaultState = {
  results: {
    subject: {},
    participant: {},
  },
  assessment: null,
  loaded: false,
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, results: action.response, loaded: true }),
  [FETCH_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.response }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genFetchEvaluation ({ requestAction: { campaignId, evaluationId } }) {
  yield put(fetchEvaluation(campaignId, evaluationId))
}

export const watchers = [
  takeLatest(FETCH_ASSESSMENT, genFetchEvaluation),
]
