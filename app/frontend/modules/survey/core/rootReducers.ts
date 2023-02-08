import { combineReducers } from 'redux'
import connection from '~/core/connection'
import builder from './builder'
import temp from './temp'
import preview from './preview'

const rootReducers = combineReducers({
  survey: combineReducers({
    builder: combineReducers(builder),
    ui: combineReducers(temp),
  }),
  preview,
  connection,
})

export type RootState = ReturnType<typeof rootReducers>

export default rootReducers
