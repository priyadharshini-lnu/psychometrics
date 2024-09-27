import { createReducer } from '~/utils/redux'

export const CLEAR_FLASH_MESSAGE = 'CLEAR_FLASH_MESSAGE'

export const clearFlashMessage = () => ({
  type: CLEAR_FLASH_MESSAGE,
})

interface Flash {
  type: string
  value: string
}
type State = Flash[]

export const defaultState: State = []

export default createReducer({
  [CLEAR_FLASH_MESSAGE]: () => defaultState,
}, defaultState)
