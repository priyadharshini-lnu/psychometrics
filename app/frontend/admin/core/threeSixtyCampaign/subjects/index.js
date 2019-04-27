import { takeLatest, put } from 'redux-saga/effects'
import { setIn } from 'utils/immutable'

const FETCH_SUBJECTS = 'threeSixty/subjects/FETCH_SUBJECTS'
const FILL_SUBJECTS = 'threeSixty/subjects/FILL_SUBJECTS'
export const CREATE_ALL = 'threeSixty/subjects/CREATE_ALL'
export const CREATE_ALL_FAILURE = 'threeSixty/subjects/CREATE_ALL_FAILURE'
export const CLEAR_FORM = 'threeSixty/subjects/CLEAR_FORM'

export const defaultState = {
  list: [],
  form: {
    attrs: {},
    errors: null,
  },
}

export const fetchSubjects = campaignId => ({
  type: FETCH_SUBJECTS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/subjects`,
  },
})

export const fillSubjects = subjects => ({ type: FILL_SUBJECTS, subjects })
export const clearForm = () => ({ type: CLEAR_FORM })

export const createAll = (campaignId, subjects) => ({
  type: CREATE_ALL,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/create_all`,
    body: { subjects },
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_SUBJECTS:
      return { ...state, list: action.response }
    case FILL_SUBJECTS:
      return setIn(state, ['form', 'attrs'], action.subjects)
    case CREATE_ALL_FAILURE:
      return setIn(state, ['form', 'errors'], action.errors)
    case CLEAR_FORM:
      return { ...state, form: defaultState.form }
    default:
      return state
  }
}

function* genFetchSubjects ({ requestAction }) {
  yield put(fetchSubjects(requestAction.campaignId))
}

function* genClearForm () {
  yield put(clearForm({}))
}

export const watchers = [takeLatest(CREATE_ALL, genFetchSubjects), takeLatest(CREATE_ALL, genClearForm)]
