import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { setIn, updateIn } from 'utils/immutable'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'


const defaultState: State = {
  list: [],
  total: 0,
}

export const get = (state): State => _.get(state, ['campaigns', 'assessors'])
export const getCurrent = (state): AssessorDetails => _.get(get(state), ['current'])

export const FETCH = 'campaigns/FETCH_ASSESSORS'
export const CREATE = 'resource/campaigns/assessor/CREATE'
export const UPDATE = 'resource/campaigns/assessor/UPDATE'
export const IMPORT = 'campaigns/assessors/IMPORT'
export const REMOVE = 'campaigns/assessor/REMOVE'

const AssessorTR = t.type({
  id: t.number,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
  evaluationsCompleted: t.number,
  status: t.string,
  createdAt: t.string,
  updatedAt: t.string,
})

type Assessor = t.TypeOf<typeof AssessorTR>

const FetchAssessorsTR = t.type({
  list: t.array(AssessorTR),
  total: t.number,
})


export const fetch = (campaignId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/new_campaigns/${campaignId}/assessors`,
    typedResponse: FetchAssessorsTR,
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const importAssessors = (campaignId: number, body: any) => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessors/import`,
    body,
    loader: true,
    typedResponse: AssessorTR,
  },
})

const RemoveTR = t.number

export const remove = (campaignId: string, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/assessors/${id}`,
    typedResponse: RemoveTR,
  },
})

export interface AssessorDetails {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  status: string
  evaluationsComplete: number
}

export interface State {
  list: Assessor[]
  total: number
}

type FetchType = ApiActionResponse<State>
type CreateType = ApiActionResponse<Assessor>
type UpdateType = ApiActionResponse<Assessor>
type RemoveType = ApiActionResponse<number>

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchType) => response,
  [CREATE]: (state: State, { response }: CreateType) => (setIn(state, ['list'], [response, ...state.list])),
  [UPDATE]: (state: State, { response }: UpdateType) => (
    updateIn(state, ['list'], (assessors: Assessor[]) => _.map(assessors, (assessor: Assessor) => {
      if (assessor.id === response.id) { return response }

      return assessor
    }))
  ),
  [REMOVE]: (state: State, { response }: RemoveType) => (
    updateIn(state, ['list'], (assessors: Assessor[]) => _.filter(
      assessors, (assessor: Assessor) => assessor.id !== response,
    ))
  ),
}

export default createReducer(HANDLERS, defaultState)

export const watchers = []
