import { takeLatest, put } from 'redux-saga/effects'
import { setIn, updateIn } from 'utils/immutable'
import { closeModal } from 'admin/core/temp/modals'
import _ from 'lodash'
import { message } from 'antd';

const FETCH_SUBJECTS = 'threeSixty/subjects/FETCH_SUBJECTS'
const FILL_SUBJECTS = 'threeSixty/subjects/FILL_SUBJECTS'
export const CREATE_ALL = 'threeSixty/subjects/CREATE_ALL'
export const CREATE_ALL_FAILURE = 'threeSixty/subjects/CREATE_ALL_FAILURE'
export const CLEAR_FORM = 'threeSixty/subjects/CLEAR_FORM'
export const UPDATE = 'threeSixty/subjects/UPDATE'
export const REMOVE = 'threeSixty/subjects/REMOVE'
export const IMPORT = 'threeSixty/subjects/IMPORT'
export const IMPORT_FAILURE = 'threeSixty/subjects/IMPORT_FAILURE'
export const IMPORT_SUCCESS = 'threeSixty/subjects/IMPORT_SUCCESS'
export const CLEAR_IMPORT_DATA = 'threeSixty/subjects/CLEAR_IMPORT_DATA'

export const defaultState = {
  list: [],
  form: {
    attrs: [],
    errors: null,
  },
  import: { errors: null },
  autocompleted: [],
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

export const importFile = (campaignId, data) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/import`,
    body: data,
    loader: true
  },
})

export const clearImportData = () => ({ type: CLEAR_IMPORT_DATA })

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
    case UPDATE: {
      const index = _.findIndex(state.list, subject => subject.id === action.response.id)
      return updateIn(state, ['list', index], () => action.response)
    }
    case REMOVE:
      return updateIn(state, 'list', subjects => subjects.filter(s => (s.id !== action.requestAction.id)))
    case IMPORT_FAILURE:
      return setIn(state, ['import', 'errors'], action.errors)
    case IMPORT:
      return setIn(state, ['import', 'existingSubjectWhosePasswordNotChanged'], action.response.existingSubjectWhosePasswordNotChanged)
    case CLEAR_IMPORT_DATA:
      return setIn(state, ['import'], defaultState.import)
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

function* genCloseImportModal ({ response }) {
  if (_.isEmpty(response.existingSubjectWhosePasswordNotChanged)) {
    yield put(closeModal())
  }
}

function* genShowImportSuccessMessage () {
  message.success('Subjects imported successfullt', 5);
}

export const watchers = [
  takeLatest([CREATE_ALL, IMPORT], genFetchSubjects),
  takeLatest(CREATE_ALL, genClearForm),
  takeLatest(CREATE_ALL, genCloseModal),
  takeLatest(IMPORT, genCloseImportModal),
  takeLatest([CREATE_ALL, IMPORT], genShowImportSuccessMessage),
]
