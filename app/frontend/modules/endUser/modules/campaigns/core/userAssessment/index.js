import { takeLatest, put } from 'redux-saga/effects'
import _ from 'lodash'
import { setIn } from '~/utils/immutable'
import { ACCEPT_POLICY } from '../project'

export const getCampaignRemainingTime = state => (
  _.get(state, ['campaigns', 'userAssessment', 'results', 'remaining_campaign_time'])
)

const FETCH = 'userAssessment/FETCH'
const FETCH_RESULTS = 'userAssessment/FETCH_RESULTS'
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
    body: { edit: isEdit, cache: new Date().valueOf() },
  },
})


export const fetchResults = (userAssessmentId, isEdit) => ({
  type: FETCH_RESULTS,
  request: {
    url: `/user_assessments/${userAssessmentId}/users_results`,
    body: { edit: isEdit, cache: new Date().valueOf() },
    camelize: false,
  },
})

export const defaultState = {
  results: {
    subject: {},
    participant: {},
  },
  assessment: {},
  userAssessment: {},
  userAssessmentData: {},
  loaded: false,
  error: false,
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, userAssessmentData: action.response }),
  [FETCH_FAILURE]: state => ({ ...state, loaded: true, error: true }),
  [FETCH_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.response }),
  [FETCH_RESULTS]: (state, action) => ({ ...state, results: action.response, loaded: true }),
  [ACCEPT_POLICY]: state => setIn(state, ['results', 'privacy_consent_required'], true),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genFetchResult ({ requestAction: { userAssessmentId, isEdit } }) {
  yield put(fetchResults(userAssessmentId, isEdit))
}

export const watchers = [
  takeLatest(FETCH_ASSESSMENT, genFetchResult),
]
