import _ from 'lodash'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { createReducer } from '~/utils/redux'

const ParticipantTR = t.type({
  id: t.number,
  campaignId: t.number,
  campaignName: t.string,
  projectName: t.string,
  candidateName: t.string,
  candidateEmail: t.string,
  evaluationStatus: t.string,
  evaluationCompleted: t.number,
  evaluationTotal: t.number,
  moderationStatus: t.string,
})

const FilterOptionTR = t.type({
  id: t.number,
  name: t.string,
})

const ParticipantListResponseTR = t.type({
  list: t.array(ParticipantTR),
  total: t.number,
  filterOptions: t.type({
    campaigns: t.array(FilterOptionTR),
  }),
})

export type Participant = t.TypeOf<typeof ParticipantTR>
export type State = t.TypeOf<typeof ParticipantListResponseTR>

const defaultState: State = { list: [], total: 0, filterOptions: { campaigns: [] } }

export const get = (state: RootState): State => _.get(state, ['assessors', 'participants'])

export const FETCH = 'assessors/participants/FETCH'

export const fetch = (tableConfig: TableConfig): ApiAction<State> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: '/assessors/participants',
    debounce: 500,
    loader: true,
    tableConfig,
    typedResponse: ParticipantListResponseTR,
  },
})

const HANDLERS = {
  [FETCH]: (_: State, { response }: ApiActionResponse<State>) => response,
}

export default createReducer(HANDLERS, defaultState)
