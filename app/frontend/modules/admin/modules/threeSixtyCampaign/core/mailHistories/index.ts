import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { updateIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'

export const get = state => _.get(state, ['threeSixtyCampaign', 'mailHistories'])

interface State {
  list: []
  total: number
}

const defaultState = {
  list: [],
  total: 0,
}

export const FETCH = 'threeSixty/mailHistories/FETCH'
export const REMOVE = 'threeSixty/mailHistories/REMOVE'

export const remove = (campaignId, emailScheduleId) => ({
  type: REMOVE,
  emailScheduleId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailScheduleId}`,
  },
})

export const fetch = (campaignId, page) => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules`,
    body: { page },
    loader: true,
  },
})

interface FetchResponse {
  emailSchedules: []
  total: number
}
type FetchType = ApiActionResponse<FetchResponse>
type RemoveType = ApiActionResponse<FetchResponse>

const HANDLERS = {
  [FETCH]: (state: State, { response: { emailSchedules, total } }: FetchType) => ({
    ...state, list: emailSchedules, total,
  }),
  [REMOVE]: (state: State, { requestAction: { emailScheduleId } }: RemoveType) => (
    updateIn(state, 'list', emailSchedules => _.filter(emailSchedules, ({ id }) => id !== emailScheduleId))
  ),
}

export default createReducer(HANDLERS, defaultState)
