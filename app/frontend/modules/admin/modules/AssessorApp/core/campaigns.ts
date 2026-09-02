import _ from 'lodash'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { createReducer } from '~/utils/redux'

const CampaignTR = t.type({
  id: t.number,
  name: t.string,
  status: t.string,
  completedSubjectEvaluationCount: t.number,
  totalSubjectEvaluationCount: t.number,
  completedSubjectModerationCount: t.number,
  totalSubjectModerationCount: t.number,
  evaluationCompletionStatus: t.string,
  moderationCompletionStatus: t.string,
})

const CampaignListResponseTR = t.type({
  list: t.array(CampaignTR),
  total: t.number,
})

export type Campaign = t.TypeOf<typeof CampaignTR>
export type State = t.TypeOf<typeof CampaignListResponseTR>

const defaultState: State = { list: [], total: 0 }

export const get = (state: RootState): State => _.get(state, ['assessors', 'campaigns'])

export const FETCH = 'assessors/campaigns/FETCH'

export const fetch = (tableConfig: TableConfig): ApiAction<State> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: '/assessors/campaigns',
    debounce: 500,
    loader: true,
    tableConfig,
    typedResponse: CampaignListResponseTR,
  },
})

const HANDLERS = {
  [FETCH]: (_: State, { response }: ApiActionResponse<State>) => response,
}

export default createReducer(HANDLERS, defaultState)
