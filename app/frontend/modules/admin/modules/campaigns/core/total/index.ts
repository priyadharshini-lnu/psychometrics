import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'
import { FETCH } from '../list'

const defaultState = 0
type FetchType = ApiActionResponse<{total: number}>

export const get = (state): number => _.get(state, ['campaigns', 'total'])

const HANDLERS = {
  [FETCH]: (_: number, { response }: FetchType) => response.total,
}

export default createReducer(HANDLERS, defaultState)
