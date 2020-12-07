import { Action } from 'redux'

export const DEPRECATED_createReducer = (handlers, defaultState) => (state = defaultState, action) => {
  const handler = handlers[action.type]
  return handler ? handler(state, action) : state
}
type Handlers<State, Types extends string, Actions extends Action<Types>> = {
  readonly [Type in Types]: (state: State, action: Actions) => State
}

export const createReducer = <State, Types extends string, Actions extends Action<Types>>(
  handlers: Handlers<State, Types, Actions>,
  initialState: State,
) => (state = initialState, action: Actions) => (
  // eslint-disable-next-line no-prototype-builtins
    handlers.hasOwnProperty(action.type) ? handlers[action.type as Types](state, action) : state
  )

export type Payload<T> = { payload: T }
