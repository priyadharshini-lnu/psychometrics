import { combineReducers } from 'redux'
import subjects from './core/threeSixtyCampaign/subjects'
import evaluators from './core/threeSixtyCampaign/evaluators'
import managers from './core/threeSixtyCampaign/managers'
import option from './core/threeSixtyCampaign/option'
import modals from './core/temp/modals'
import autocomplete from './core/temp/autocomplete'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    subjects,
    evaluators,
    managers,
    option
  }),
  temp: combineReducers({
    modals,
    autocomplete,
  }),
})
