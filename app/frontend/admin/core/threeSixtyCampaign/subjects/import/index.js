import { takeLatest, put } from 'redux-saga/effects'
import { setIn } from 'utils/immutable'
import { message } from 'antd'
import _ from 'lodash'
import { closeModal } from 'admin/core/temp/modals'
import { genFetchSubjects } from '../index'

export const IMPORT = 'threeSixty/subjects/IMPORT'
export const IMPORT_FAILURE = 'threeSixty/subjects/IMPORT_FAILURE'
export const IMPORT_SUCCESS = 'threeSixty/subjects/IMPORT_SUCCESS'
export const CLEAR_IMPORT_DATA = 'threeSixty/subjects/CLEAR_IMPORT_DATA'

export const importFile = (campaignId, data) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/import`,
    body: data,
    loader: true,
  },
})

export const clearImportData = () => ({ type: CLEAR_IMPORT_DATA })

export const defaultState = { errors: null }

const HANDLERS = {
  [IMPORT_FAILURE]: (state, { errors }) => setIn(state, ['errors'], errors),
  [IMPORT]: (state, { response }) => (
    setIn(
      state,
      ['existingSubjectWhosePasswordNotChanged'],
      response.existingSubjectWhosePasswordNotChanged,
    )
  ),
  [CLEAR_IMPORT_DATA]: () => defaultState,
}


export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genCloseImportModal ({ response }) {
  if (_.isEmpty(response.existingSubjectWhosePasswordNotChanged)) {
    yield put(closeModal())
  }
}

function* genShowImportSuccessMessage () {
  yield message.success('Subjects imported successfully', 5)
}

export const watchers = [
  takeLatest(IMPORT, genFetchSubjects),
  takeLatest(IMPORT, genCloseImportModal),
  takeLatest(IMPORT, genShowImportSuccessMessage),
]
