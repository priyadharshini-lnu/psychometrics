import { Action, AnyAction } from 'redux'

type Handlers<State, Types extends string> = {
  readonly [Type in Types]: (state: State, action: AnyAction) => State
}

export const createReducer = <State, Types extends string, Actions extends Action<Types>>(
  handlers: Handlers<State, Types>,
  initialState: State,
) => (state = initialState, action: Actions) => (
  // eslint-disable-next-line no-prototype-builtins
    handlers.hasOwnProperty(action.type) ? handlers[action.type as Types](state, action) : state
  )

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IPayload<P, T = any> extends AnyAction { // eslint-disable-line @typescript-eslint/no-explicit-any
  payload: P
  type: T
}

export type Payload<P, T = any> = IPayload<P, T> // eslint-disable-line @typescript-eslint/no-explicit-any
