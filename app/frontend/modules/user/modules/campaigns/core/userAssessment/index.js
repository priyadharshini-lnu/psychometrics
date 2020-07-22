// import { takeLatest } from 'redux-saga/effects'

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

export const fetchUserAssessment = (assignId, isEdit) => ({
  type: FETCH,
  request: {
    url: `/user_assessments/${assignId}`,
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
  [FETCH_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.response, loaded: true }),
}
export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

// function* genFetchResult ({ requestAction: { userAssessmentId, isEdit } }) {
//   fetch result
// }

export const watchers = [
  // takeLatest(FETCH_ASSESSMENT, genFetchResult),
]
