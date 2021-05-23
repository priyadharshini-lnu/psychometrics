import { Action, AnyAction } from 'redux'

type Handlers<State, Types extends string> = {
  readonly [Type in Types]: (state: State, action: AnyAction) => State
}

export const createReducer = <State, Types extends string, Actions extends Action<Types>>(
  handlers: Handlers<State, Types>,
  initialState: State,
  preprocessor?: (state: State, action: Action) => State,
) => (state = initialState, action: Actions) => {
    const newState = preprocessor ? preprocessor(state, action) : state
    // eslint-disable-next-line no-prototype-builtins
    return handlers.hasOwnProperty(action.type) ? handlers[action.type as Types](newState, action) : newState
  }

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IPayload<P, T = any> extends AnyAction { // eslint-disable-line @typescript-eslint/no-explicit-any
  payload: P
  type: T
}

export type Payload<P, T = any> = IPayload<P, T> // eslint-disable-line @typescript-eslint/no-explicit-any
export type CustomAction<P, T = string> = P & Action<T>
