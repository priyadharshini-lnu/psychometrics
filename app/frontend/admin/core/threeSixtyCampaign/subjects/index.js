import { takeLatest, put } from 'redux-saga/effects'
import { setIn, updateIn } from 'utils/immutable'
import { closeModal } from 'admin/core/temp/modals'
import _ from 'lodash'
import importReducer from './import'

const FETCH_SUBJECTS = 'threeSixty/subjects/FETCH_SUBJECTS'
const FILL_SUBJECTS = 'threeSixty/subjects/FILL_SUBJECTS'
export const CREATE_ALL = 'threeSixty/subjects/CREATE_ALL'
export const CREATE_ALL_FAILURE = 'threeSixty/subjects/CREATE_ALL_FAILURE'
export const CLEAR_FORM = 'threeSixty/subjects/CLEAR_FORM'
export const UPDATE = 'threeSixty/subjects/UPDATE'
export const REMOVE = 'threeSixty/subjects/REMOVE'
export const DOWNLOAD_REPORT = 'threeSixty/subjects/DOWNLOAD_REPORT'

export const defaultState = {
  list: [],
  total: 0,
  form: {
    attrs: [],
    errors: null,
  },
  autocompleted: [],
}

export const fetchSubjects = (campaignId, page, q) => ({
  type: FETCH_SUBJECTS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/subjects`,
    body: {
      page,
      q,
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
    loader: true,
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

export const downloadReport = (campaignId, subjectId) => ({
  type: DOWNLOAD_REPORT,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/reports/download`,
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

const HANDLERS = {
  [FETCH_SUBJECTS]: (state, { response: { subjects, total } }) => ({ ...state, list: subjects, total }),
  [FILL_SUBJECTS]: (state, { subjects }) => setIn(state, ['form', 'attrs'], subjects),
  [CREATE_ALL_FAILURE]: (state, { errors }) => setIn(state, ['form', 'errors'], errors),
  [CLEAR_FORM]: state => ({ ...state, form: defaultState.form }),
  [UPDATE]: (state, { response }) => {
    const index = _.findIndex(state.list, subject => subject.id === response.id)
    return updateIn(state, ['list', index], () => response)
  },
  [REMOVE]: (state, { requestAction }) => (
    updateIn(state, 'list', subjects => subjects.filter(s => (s.id !== requestAction.id)))
  ),
}

export default function reducer (state = defaultState, action) {
  const stateFromInnerReducer = updateIn(
    state, ['import'], state => importReducer(state, action),
  )
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}

export function* genFetchSubjects ({ requestAction }) {
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
