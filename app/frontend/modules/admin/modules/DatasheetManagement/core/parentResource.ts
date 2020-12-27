import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'
import { createReducer, Payload } from 'utils/redux'

export interface State {
  id?: number
  type?: string
}

const defaultState: State = {}

const SET = 'parentResource/SET'

export const get = (state: RootState): State => _.get(state, ['datasheet', 'parentResource'])

export const set = parentResource => (
  { type: SET, payload: parentResource }
)

const HANDLERS = {
  [SET]: (_: State, { payload }: Payload<State>) => payload,
}

export default createReducer(HANDLERS, defaultState)
