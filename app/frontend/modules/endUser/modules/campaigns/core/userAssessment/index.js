import { takeLatest, put } from 'redux-saga/effects'
import _ from 'lodash'

export const getCampaignRemainingTime = state => (
  _.get(state, ['campaigns', 'userAssessment', 'results', 'remaining_campaign_time'])
)

const FETCH = 'userAssessment/FETCH'
const FETCH_FAILURE = 'userAssessment/FETCH_FAILURE'

const FETCH_ASSESSMENT = 'userAssessment/FETCH_ASSESSMENT'

export const fetchAssessment = (userAssessmentId, isEdit) => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/user_assessments/${userAssessmentId}/assessment`,
    camelize: false,
  },
  userAssessmentId,
  isEdit,
})

export const fetchUserAssessment = (userAssessmentId, isEdit) => ({
  type: FETCH,
  request: {
    url: `/user_assessments/${userAssessmentId}`,
    camelize: false,
    body: { edit: isEdit, cache: new Date().valueOf() },
  },
})

export const defaultState = {
  results: {
    subject: {},
    participant: {},
  },
  assessment: {},
  loaded: false,
  error: false,
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, results: action.response, loaded: true }),
  [FETCH_FAILURE]: state => ({ ...state, loaded: true, error: true }),
  [FETCH_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.response }),
}
export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genFetchResult ({ requestAction: { userAssessmentId, isEdit } }) {
  yield put(fetchUserAssessment(userAssessmentId, isEdit))
}

export const watchers = [
  takeLatest(FETCH_ASSESSMENT, genFetchResult),
]
