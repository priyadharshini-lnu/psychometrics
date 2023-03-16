import { createReducer } from '~/utils/redux'

interface Flash {
  type: string
  value: string
}
type State = Flash[]

export const defaultState: State = []

export default createReducer({}, defaultState)
