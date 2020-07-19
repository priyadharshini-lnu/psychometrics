import { combineReducers } from 'redux'
import builder from './builder'
import temp from './temp'
import preview from './preview'

const rootReducers = combineReducers({
  survey: combineReducers({
    builder: combineReducers(builder),
    ui: combineReducers(temp),
  }),
  preview,
})

export type AppState = ReturnType<typeof rootReducers>

export default rootReducers
