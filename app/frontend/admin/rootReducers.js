import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'
import evaluators from './core/threeSixtyCampaign/evaluators'
import managers from './core/threeSixtyCampaign/managers'
import modals from './core/temp/modals'
import users from './core/temp/users'
import errors from './core/temp/errors'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
    managers,
  }),
  temp: combineReducers({
    modals,
    users,
    errors,
  }),
})
