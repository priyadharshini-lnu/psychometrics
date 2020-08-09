import { combineReducers } from 'redux'
import builder from './builder'
import pages from './builder/page'
import modules from './builder/module'
import temp from './temp'

const rootReducer = combineReducers({
  report: combineReducers({
    builder,
    pages,
    modules,
    ui: combineReducers(temp),
  }),
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
