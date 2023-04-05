import { takeLatest, put } from 'redux-saga/effects'
import { message } from 'antd'
import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { AnyAction } from 'redux'
import { closeModal } from '~/modules/admin/core/ui/modals'
import { createReducer } from '~/utils/redux'
import { setIn } from '~/utils/immutable'
import { genFetchSubjects } from '../index'

export const IMPORT = 'threeSixty/subjects/IMPORT'
export const IMPORT_FAILURE = 'threeSixty/subjects/IMPORT_FAILURE'
export const IMPORT_SUCCESS = 'threeSixty/subjects/IMPORT_SUCCESS'
export const CLEAR_IMPORT_DATA = 'threeSixty/subjects/CLEAR_IMPORT_DATA'

export const get = state => _.get(state, ['threeSixtyCampaign', 'subjects', 'import'])

export const importFile = (campaignId: number, data: FormData) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/import`,
    body: data,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

export const clearImportData = () => ({ type: CLEAR_IMPORT_DATA })

export const defaultState = { errors: null }

type ImportType = ApiActionResponse<{existingSubjectsWhosePasswordNotChanged: boolean}>
type ImportFailurType = ApiActionResponse<{errors: {}}>

const HANDLERS = {
  [IMPORT_FAILURE]: (state, { errors }: ImportFailurType) => setIn(state, ['errors'], errors),
  [IMPORT]: (state, { response }: ImportType) => (
    setIn(
      state,
      ['existingSubjectsWhosePasswordNotChanged'],
      response.existingSubjectsWhosePasswordNotChanged,
    )
  ),
  [CLEAR_IMPORT_DATA]: () => defaultState,
}

export default createReducer(HANDLERS, defaultState)

function* genCloseImportModal ({ response }: AnyAction) {
  if (_.isEmpty(response.existingSubjectsWhosePasswordNotChanged)) {
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
