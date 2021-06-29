import * as t from 'io-ts'
import { RootState } from 'modules/admin/core/rootReducers'
import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import ApiAction from 'interfaces/ApiAction'
import { updateIn } from 'utils/immutable'
import { AnyAction } from 'redux'

export const FETCH = 'campaigns/assessorAssessments/FETCH'
export const RESET = 'campaigns/assessorAssessments/RESET'
export const SELECT_RECORDS = 'campaigns/assessorAssessments/SELECT_RECORDS'
export const BULK_DELETE = 'campaigns/assessorAssessments/BULK_DELETE'
export const CREATE = 'resource/assessorAssessment/subject/CREATE'

export const get = (state: RootState) => _.get(state, ['campaigns', 'assessorAssessments'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')

export const AssessorAssessmentTR = t.type({
  id: t.number,
  assessmentName: t.string,
  subjectName: t.string,
  subjectEmail: t.string,
  status: t.string,
  permissions: t.type({
    resetEvaluation: t.boolean,
  }),
})

export const StateTR = t.type({
  list: t.array(AssessorAssessmentTR),
  total: t.number,
})

export type AssessorAssessment = t.TypeOf<typeof AssessorAssessmentTR>
export type State = t.TypeOf<typeof StateTR>

const defaultState: State = { list: [], total: 0 }

export const fetch = (campaignId: number, assessorId: number, tableConfig: TableConfig): ApiAction<State> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessors/${assessorId}/user_assessments`,
    debounce: 500,
    tableConfig,
    typedResponse: StateTR,
  },
})

export const reset = (campaignId: number, assessorId: number, id: number) => ({
  type: RESET,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessors/${assessorId}/user_assessments/${id}/reset`,
  },
})

export const bulkDelete = (campaignId: number, assessorId: number, ids: number[]) => ({
  type: BULK_DELETE,
  ids,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/assessors/${assessorId}/user_assessments/bulk_delete`,
    body: { ids },
    loader: true,
  },
})

export const selectRecords = (ids: number[]) => ({
  type: SELECT_RECORDS,
  payload: { ids },
})

type SelectRecordsType = ReturnType<typeof selectRecords>
interface BulkDeleteAction extends AnyAction {
  requestAction: {
    ids: number[]
  }
}

const HANDLERS = {
  [FETCH]: (state: State, { response }: ApiActionResponse<State>) => ({ ...state, ...response }),
  [SELECT_RECORDS]: (state: State, { payload: { ids } }: SelectRecordsType) => ({ ...state, selectedIds: ids }),
  [BULK_DELETE]: (state: State, { requestAction: { ids } }: BulkDeleteAction) => (
    updateIn(state, ['selectedIds'], (selectedIds: number[]) => (
      selectedIds.filter(id => !ids.includes(id))
    ))
  ),
  [CREATE]: (state: State, { response }: ApiActionResponse<AssessorAssessment>) => ({
    ...state, total: state.total + 1, list: [response, ...state.list],
  }),
}

export default createReducer(HANDLERS, defaultState)
