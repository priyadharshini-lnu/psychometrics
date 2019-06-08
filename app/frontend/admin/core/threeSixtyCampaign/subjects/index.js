import { takeLatest, put } from 'redux-saga/effects'
import { setIn, updateIn } from 'utils/immutable'
import { closeModal } from 'admin/core/temp/modals'
import _ from 'lodash'
import params from '../settings'

const FETCH_SUBJECTS = 'threeSixty/subjects/FETCH_SUBJECTS'
const FILL_SUBJECTS = 'threeSixty/subjects/FILL_SUBJECTS'
export const CREATE_ALL = 'threeSixty/subjects/CREATE_ALL'
export const CREATE_ALL_FAILURE = 'threeSixty/subjects/CREATE_ALL_FAILURE'
export const CLEAR_FORM = 'threeSixty/subjects/CLEAR_FORM'
export const UPDATE = 'threeSixty/subjects/UPDATE'
export const REMOVE = 'threeSixty/subjects/REMOVE'

export const defaultState = {
  list: [],
  form: {
    attrs: {},
    errors: null,
  },
  autocompleted: [],
}

export const fetchSubjects = (campaignId, offset = 0) => ({
  type: FETCH_SUBJECTS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/subjects`,
    body: {
      limit: params.pageLimit,
      offset,
    },
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

export const update = (campaignId, subjectId, data) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}`,
    body: data,
  },
})

export const remove = (campaignId, subjectId) => ({
  type: REMOVE,
  id: subjectId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_SUBJECTS:
      return { ...state, list: action.response.subjects, total: action.response.total }
    case FILL_SUBJECTS:
      return setIn(state, ['form', 'attrs'], action.subjects)
    case CREATE_ALL_FAILURE:
      return setIn(state, ['form', 'errors'], action.errors)
    case CLEAR_FORM:
      return { ...state, form: defaultState.form }
    case UPDATE: {
      const index = _.findIndex(state.list, subject => subject.id === action.response.id)
      return updateIn(state, ['list', index], () => action.response)
    }
    case REMOVE:
      return updateIn(state, 'list', subjects => subjects.filter(s => (s.id !== action.requestAction.id)))
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
function* genCloseModal () {
  yield put(closeModal())
}

export const watchers = [
  takeLatest(CREATE_ALL, genFetchSubjects),
  takeLatest(CREATE_ALL, genClearForm),
  takeLatest(CREATE_ALL, genCloseModal),
]
