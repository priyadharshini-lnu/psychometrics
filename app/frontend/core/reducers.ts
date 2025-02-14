import { combineReducers } from 'redux'
import flash from './flash'
import request from './request'

const rootReducer = () => combineReducers({
  flash,
  request,
})

export type RootState = ReturnType<ReturnType<typeof rootReducer>>

export default rootReducer
