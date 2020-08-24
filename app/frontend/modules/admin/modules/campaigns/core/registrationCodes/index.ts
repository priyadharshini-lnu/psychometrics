import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { setIn, updateIn } from 'utils/immutable'

export interface RegistrationCode {
  id: number
  name: string
  code: string
  totalCount: number
  useCount: number
  startDate: Date
  endDate: Date
}

const defaultState = {
  list: [],
  total: 0,
}

export const get = (state): RegistrationCode[] => _.get(state, ['campaigns', 'registrationCodes'])

export const FETCH = 'campaigns/FETCH_REGISTRATION_CODES'
export const CREATE = 'resource/campaigns/registrationCodes/CREATE'
export const UPDATE = 'resource/campaigns/registrationCodes/UPDATE'
export const DESTROY = 'resource/campaigns/registrationCodes/DESTROY'

export const fetch = (campaignId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/new_campaigns/${campaignId}/registration_codes`,
  },
})

export const destroy = (campaignId: string, id: number) => ({
  type: DESTROY,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/registration_codes/${id}`,
  },
})

export interface FetchAction {
  response: {
    list: []
    total: 0
  }
}

export interface State {
  list: RegistrationCode[]
  total: number
}

const HANDLERS = {
  [FETCH]: (_, { response }: FetchAction) => response,
  [CREATE]: (state: State, { response }: { response: RegistrationCode }) => (
    setIn(state, ['list'], [response, ...state.list])
  ),
  [DESTROY]: (state: State, { response }: { response: number }) => (
    updateIn(state, ['list'], (codes: RegistrationCode[]) => _.filter(
      codes, (code: RegistrationCode) => code.id !== response,
    ))
  ),
  [UPDATE]: (state: State, { response }: { response: RegistrationCode }) => (
    updateIn(state, ['list'], (codes: RegistrationCode[]) => _.map(codes, (code: RegistrationCode) => {
      if (code.id === response.id) { return response }

      return code
    }))
  ),
}

export default createReducer(HANDLERS, defaultState)
