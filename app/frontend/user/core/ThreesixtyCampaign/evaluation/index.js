import { takeLatest, put } from 'redux-saga/effects'

const FETCH = 'threeSixty/evaluation/FETCH'
const FETCH_ASSESSMENT = 'threeSixty/evaluation/FETCH_ASSESSMENT'

export const fetchAssessment = (campaignId, evaluationId) => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/campaigns/${campaignId}/assessments`,
  },
  campaignId,
  evaluationId,
})

export const fetchEvaluation = (campaignId, evaluationId) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}`,
  },
})

export const defaultState = {
  results: {},
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
