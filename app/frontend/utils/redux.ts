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

interface IPayload<P, T = any> extends AnyAction { // eslint-disable-line @typescript-eslint/no-explicit-any
  payload: P
  type: T
}

export type Payload<P, T = any> = IPayload<P, T> // eslint-disable-line @typescript-eslint/no-explicit-any
export type CustomAction<P, T = string> = P & Action<T>

export const appendToList = <
  State extends { list: Array<{ id: number | null }>; total: number },
  Response extends { id: number | null }
>(
    state: State,
    response: Response,
  ): State => {
  const doesItemExistsInList = state.list.some(
    item => item.id === response.id,
  )

  return {
    ...state,
    list: doesItemExistsInList
      ? state.list.map((item) => {
        if (item.id === response.id) {
          return response
        }
        return item
      })
      : [response, ...state.list],
    total: doesItemExistsInList ? state.total : state.total + 1,
  }
}

export const removeFromList = <
  State extends { list: Array<{ id: number | null }>; total: number },
  Response extends { id: number | null }
>(
    state: State,
    response: Response,
  ): State => ({
    ...state,
    list: state.list.filter(admin => admin.id !== response.id),
    total: state.total - 1,
  })
