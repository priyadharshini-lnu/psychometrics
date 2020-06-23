import { combineReducers } from 'redux'
import builder from './builder'
import pages from './builder/page'
import modules from './builder/module'
import temp from './temp'

export default combineReducers({
  report: combineReducers({
    builder,
    pages,
    modules,
    temp: combineReducers(temp),
  }),
})
