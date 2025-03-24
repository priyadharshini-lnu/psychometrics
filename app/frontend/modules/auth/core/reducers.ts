import { combineReducers } from 'redux'
import projectConfig from './projectConfig'
import flash from './flash'
import csrfToken from './csrfToken'
import errors from './errors'
import user from './user'
import config from '~/core/config'

const rootReducer = () => combineReducers({
  csrfToken,
  projectConfig,
  flash,
  errors,
  user,
  config,
})

export type RootState = ReturnType<ReturnType<typeof rootReducer>>

export default rootReducer
