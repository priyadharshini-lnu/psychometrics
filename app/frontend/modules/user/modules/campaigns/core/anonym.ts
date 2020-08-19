import { takeLatest, put } from 'redux-saga/effects'
import humps from 'humps'

const FETCH = 'anonym/FETCH'
const FETCH_FAILURE = 'anonym/FETCH_FAILURE'

const FETCH_ASSESSMENT = 'anonym/FETCH_ASSESSMENT'

interface FetcgAssessment { type: typeof FETCH_ASSESSMENT, assessmentKey: string, request: object }

export const fetchAssessment = (assessmentKey: string): FetcgAssessment => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/anonym/${assessmentKey}/assessment`,
    camelize: false,
  },
  assessmentKey,
})

export const fetchResult = (assessmentKey: string) => ({
  type: FETCH,
  request: {
    url: `/anonym/${assessmentKey}`,
    camelize: false,
    body: { cache: new Date().valueOf() },
  },
})

interface State {
  results: {
    subject: object,
    user: object,
    participant: object,
  },
  assessment: object | null,
  loaded: boolean,
  error: boolean,
}

export const defaultState: State = {
  results: {
    subject: {},
    user: {},
    participant: {},
  },
  assessment: null,
  loaded: false,
  error: false,
}

const HANDLERS = {
  [FETCH]: (state, { response }) => {
    const { subject, user } = response
    const results = { ...response, subject: humps.camelizeKeys(subject), user: humps.camelizeKeys(user) }
    return { ...state, results, loaded: true }
  },
  [FETCH_FAILURE]: state => ({ ...state, loaded: true, error: true }),
  [FETCH_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.response }),
}
export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function* genFetchEvaluation ({
  requestAction: {
    assessmentKey,
  },
}: any) {
  yield put(fetchResult(assessmentKey))
}

export const watchers = [
  takeLatest(FETCH_ASSESSMENT, genFetchEvaluation),
]
