import { combineReducers } from 'redux'
import flash from './flash'

const rootReducer = () => combineReducers({
  flash,
})

export type RootState = ReturnType<ReturnType<typeof rootReducer>>

export default rootReducer
