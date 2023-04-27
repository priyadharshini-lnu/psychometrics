import { takeLatest, put } from 'redux-saga/effects'
import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { closeModal } from '~/modules/admin/core/ui/modals'
import { createReducer } from '~/utils/redux'
import { setIn, updateIn } from '~/utils/immutable'
import importReducer from './import'

const FETCH_SUBJECTS = 'threeSixty/subjects/FETCH_SUBJECTS'
const FILL_SUBJECTS = 'threeSixty/subjects/FILL_SUBJECTS'
export const CREATE_ALL = 'threeSixty/subjects/CREATE_ALL'
export const CREATE_ALL_FAILURE = 'threeSixty/subjects/CREATE_ALL_FAILURE'
export const CLEAR_FORM = 'threeSixty/subjects/CLEAR_FORM'
export const UPDATE = 'threeSixty/subjects/UPDATE'
export const REMOVE = 'threeSixty/subjects/REMOVE'
export const DOWNLOAD_REPORT = 'threeSixty/subjects/DOWNLOAD_REPORT'
export const REGENERATE_REPORT = 'threeSixty/subjects/REGENERATE_REPORT'

export const get = state => _.get(state, ['threeSixtyCampaign', 'subjects'])
export const getForm = state => _.get(get(state), ['form'])

interface Subject {
  id: number
}

interface State {
  list: Subject[],
  permissions: {
    addSubject: boolean
    editDimension: boolean
    editUser: boolean
    exportCompletionStatus: boolean
    exportResults: boolean
    manageDatasheets: boolean
    manageRelationships: boolean
    resetAllNominations: boolean
    resetAllParticipants: boolean
    rescoreAssessment: boolean
  },
  total: number,
  form: {
    attrs: [],
    errors: null,
  },
  autocompleted: [],
}

interface UpdateData {
  report_approval_status?: string
  report_release_status?: string
  evaluation_status?: string
}

export const defaultState: State = {
  list: [],
  permissions: {
    addSubject: false,
    editDimension: false,
    editUser: false,
    exportCompletionStatus: false,
    exportResults: false,
    manageDatasheets: false,
    manageRelationships: false,
    resetAllNominations: false,
    resetAllParticipants: false,
    rescoreAssessment: false,
  },
  total: 0,
  form: {
    attrs: [],
    errors: null,
  },
  autocompleted: [],
}

export const fetchSubjects = (campaignId: number, page = '', q = '') => ({
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

export const createAll = (campaignId: number, subjects: Subject[]) => ({
  type: CREATE_ALL,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/create_all`,
    body: { subjects },
    loader: true,
  },
})

export const update = (campaignId: number, subjectId: number, data: UpdateData) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}`,
    body: data,
  },
})

export const downloadReport = (campaignId: number, subjectId: number) => ({
  type: DOWNLOAD_REPORT,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/reports/download`,
  },
})

export const regenerateReport = (campaignId: number, subjectId: number) => ({
  type: REGENERATE_REPORT,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/reports/regenerate`,
  },
})

export const remove = (campaignId: number, subjectId: number, removeLicenceUsage: boolean) => ({
  type: REMOVE,
  id: subjectId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}`,
    body: { removeLicenceUsage },
  },
})

type FetchSubjectsType = ApiActionResponse<{
  subjects: Subject[],
  permissions: {
    addSubject: boolean
    editDimension: boolean
    editUser: boolean
    exportCompletionStatus: boolean
    exportResults: boolean
    manageDatasheets: boolean
    manageRelationships: boolean
    resetAllNominations: boolean
    resetAllParticipants: boolean
    rescoreAssessment: boolean
  },
  total: number
}>
type FillSubjectsType = ApiActionResponse<{list: Subject[], total: number}>
type CreateAllFailureType = ApiActionResponse<{errors: {}}>
type UpdateType = ApiActionResponse<Subject>
type RemoveType = ApiActionResponse<Subject>

const HANDLERS = {
  [FETCH_SUBJECTS]: (state: State, { response: { subjects, permissions, total } }: FetchSubjectsType) => ({
    ...state, list: subjects, permissions, total,
  }),
  [FILL_SUBJECTS]: (state: State, { subjects }: FillSubjectsType) => setIn(state, ['form', 'attrs'], subjects),
  [CREATE_ALL_FAILURE]: (state: State, { errors }: CreateAllFailureType) => setIn(state, ['form', 'errors'], errors),
  [CLEAR_FORM]: (state: State) => ({ ...state, form: defaultState.form }),
  [UPDATE]: (state: State, { response }: UpdateType) => {
    const index = _.findIndex(state.list, subject => subject.id === response.id)
    return updateIn(state, ['list', index], () => response)
  },
  [REMOVE]: (state: State, { requestAction }: RemoveType) => (
    updateIn(state, 'list', subjects => subjects.filter(s => (s.id !== requestAction.id)))
  ),
}

export default createReducer(HANDLERS, defaultState, (state, action) => updateIn(
  state, ['import'], state => importReducer(state, action),
))

export function* genFetchSubjects ({ requestAction }: CreateAllFailureType) {
  yield put(fetchSubjects(requestAction.campaignId))
}

function* genClearForm () {
  yield put(clearForm())
}

function* genCloseModal () {
  yield put(closeModal())
}

export const watchers = [
  takeLatest(CREATE_ALL, genFetchSubjects),
  takeLatest(CREATE_ALL, genClearForm),
  takeLatest(CREATE_ALL, genCloseModal),
]
