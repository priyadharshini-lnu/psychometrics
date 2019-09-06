import { takeLatest, put } from 'redux-saga/effects'

const FETCH = 'threeSixty/assign/FETCH'
const FETCH_FAILURE = 'threeSixty/assign/FETCH_FAILURE'

const FETCH_ASSESSMENT = 'threeSixty/assign/FETCH_ASSESSMENT'

export const fetchAssessment = (assignId, isEdit) => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/assigns/${assignId}/assessment`,
    camelize: false,
  },
  assignId,
  isEdit,
})

export const fetchAssign = (assignId, isEdit) => ({
  type: FETCH,
  request: {
    url: `/assigns/${assignId}/pass`,
    camelize: false,
    body: { edit: isEdit },
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

function* genFetchAssign ({ requestAction: { assignId, isEdit } }) {
  yield put(fetchAssign(assignId, isEdit))
}

export const watchers = [
  takeLatest(FETCH_ASSESSMENT, genFetchAssign),
]
