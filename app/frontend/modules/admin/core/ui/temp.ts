import { createReducer } from '~/utils/redux'
import { RootState } from '~/modules/admin/core/rootReducers'

const SET_DATA = 'ui/temp/SET_DATA'

export interface State {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export const defaultState: State = {
  data: null,
}

export const setData = data => ({ type: SET_DATA, data })

export type SetData = ReturnType<typeof setData>

const HANDLERS = {
  [SET_DATA]: (_: State, { data }: SetData): State => ({ data }),
}

export const getData = (state: RootState) => state.ui.temp.data

export default createReducer(HANDLERS, defaultState)
