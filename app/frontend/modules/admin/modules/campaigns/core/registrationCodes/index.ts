import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { createReducer } from '~/utils/redux'
import { setIn, updateIn } from '~/utils/immutable'

export interface RegistrationCode {
  id: number
  name: string
  code: string
  totalCount: number
  useCount: number
  startDate: Date
  endDate: Date
  permissions: {
    copy: boolean
    downloadQrcode: boolean
    remove: boolean
    edit: boolean
  }
}

const defaultState: State = {
  list: [],
  total: 0,
  permissions: {
    create: false,
  },
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
    loader: true,
  },
})

export const destroy = (campaignId: string, id: number) => ({
  type: DESTROY,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/registration_codes/${id}`,
  },
})


export interface State {
  list: RegistrationCode[]
  total: number
  permissions: {
    create: boolean
  }
}

type FetchType = ApiActionResponse<{list: [], total: number}>
type CreateType = ApiActionResponse<RegistrationCode>
type DestroyType = ApiActionResponse<number>
type UpdateType = ApiActionResponse<RegistrationCode>

const HANDLERS = {
  [FETCH]: (_, { response }: FetchType) => response,
  [CREATE]: (state: State, { response }: CreateType) => (
    setIn(state, ['list'], [response, ...state.list])
  ),
  [DESTROY]: (state: State, { response }: DestroyType) => (
    updateIn(state, ['list'], (codes: RegistrationCode[]) => _.filter(
      codes, (code: RegistrationCode) => code.id !== response,
    ))
  ),
  [UPDATE]: (state: State, { response }: UpdateType) => (
    updateIn(state, ['list'], (codes: RegistrationCode[]) => _.map(codes, (code: RegistrationCode) => {
      if (code.id === response.id) { return response }

      return code
    }))
  ),
}

export default createReducer(HANDLERS, defaultState)
