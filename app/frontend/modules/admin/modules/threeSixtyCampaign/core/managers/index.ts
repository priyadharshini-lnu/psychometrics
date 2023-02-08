import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'

const FETCH_MANAGERS = 'threeSixty/managers/FETCH_MANAGERS'

interface State {
  list: []
  total: number
  permissions: Permissions
}

interface Permissions {
  editDimension: boolean
  exportCompletionStatus: boolean
  exportResults: boolean
  manageDatasheets: boolean
  manageRelationships: boolean
  resetAllNominations: boolean
  resetAllParticipants: boolean
}

export const defaultState = {
  list: [],
  total: 0,
  permissions: {
    editDimension: false,
    exportCompletionStatus: false,
    exportResults: false,
    manageDatasheets: false,
    manageRelationships: false,
    resetAllNominations: false,
    resetAllParticipants: false,
  },
}

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
  permissions: Permissions
}
type FetchType = ApiActionResponse<FetchResponse>

const HANDLERS = {
  [FETCH_MANAGERS]: (state: State, action: FetchType) => ({
    ...state,
    list: action.response.managers,
    total: action.response.total,
    permissions: action.response.permissions,
  }),
}

export default createReducer(HANDLERS, defaultState)
