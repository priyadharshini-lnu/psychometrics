import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'

const FETCH_MANAGERS = 'threeSixty/managers/FETCH_MANAGERS'

interface State {
  list: []
  total: number
}

export const defaultState = { list: [], total: 0 }

export const fetchManagers = (campaignId: number, page = '', q = '') => ({
  type: FETCH_MANAGERS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/managers`,
    body: {
      page,
      q,
    },
  },
})
interface FetchResponse {
  managers: []
  total: number
}
type FetchType = ApiActionResponse<FetchResponse>

const HANDLERS = {
  [FETCH_MANAGERS]: (state: State, action: FetchType) => ({
    ...state, list: action.response.managers, total: action.response.total,
  }),
}

export default createReducer(HANDLERS, defaultState)
