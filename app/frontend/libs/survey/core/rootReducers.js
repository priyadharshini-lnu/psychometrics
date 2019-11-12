import { combineReducers } from 'redux'
import modals from './modals'

export default combineReducers({
  survey: combineReducers({
    modals,
    app: {},
    assessment: {},
    preview: {},

  }),
})
