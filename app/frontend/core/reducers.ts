import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import flash from './flash'

const rootReducer = history => combineReducers({
  flash,
  router: connectRouter(history),
})

export type RootState = ReturnType<ReturnType<typeof rootReducer>>

export default rootReducer
