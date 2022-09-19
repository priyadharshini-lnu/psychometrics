import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import projectConfig from './projectConfig'
import flash from './flash'
import csrfToken from './csrfToken'
import errors from './errors'
import user from './user'

const rootReducer = history => combineReducers({
  csrfToken,
  projectConfig,
  flash,
  errors,
  user,
  router: connectRouter(history),
})

export type RootState = ReturnType<ReturnType<typeof rootReducer>>

export default rootReducer
