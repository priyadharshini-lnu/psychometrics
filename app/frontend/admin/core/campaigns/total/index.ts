import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import { FETCH_CAMPAIGNS, FetchAction } from '../list'

const defaultState = 0

export const get = (state): number => _.get(state, ['campaigns', 'total'])

const HANDLERS = {
  [FETCH_CAMPAIGNS]: (_: number, { response }: FetchAction) => response.total,
}

export default createReducer(HANDLERS, defaultState)
