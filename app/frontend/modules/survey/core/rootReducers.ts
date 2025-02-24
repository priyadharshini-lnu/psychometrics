import { combineReducers } from 'redux'
import connection from '~/core/connection'
import builder from './builder'
import temp from './temp'
import preview from './preview'
import request from '~/core/request'
import currentUser from '~/core/currentUser'
import config from '~/core/config'

const rootReducers = combineReducers({
  survey: combineReducers({
    builder: combineReducers(builder),
    ui: combineReducers(temp),
  }),
  preview,
  connection,
  request,
  currentUser,
  config,
})

export type RootState = ReturnType<typeof rootReducers>

export default rootReducers
