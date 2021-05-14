import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { FETCH } from '../list'

const defaultState: State = {
  permissions: {
    create: false,
  },
}

export interface State {
  permissions: {
    create: boolean,
  },
}

type FetchType = ApiActionResponse<State>

export const get = (state): {} => _.get(state, ['campaigns', 'permissions'])

const HANDLERS = {
  [FETCH]: (_: {}, { response }: FetchType) => response.permissions,
}

export default createReducer(HANDLERS, defaultState)
