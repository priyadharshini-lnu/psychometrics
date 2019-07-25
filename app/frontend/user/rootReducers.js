import { combineReducers } from 'redux'
import campaign from './core/ThreesixtyCampaign/campaign'
import campaigns from './core/ThreesixtyCampaign/campaigns'
import nomination from './core/ThreesixtyCampaign/nomination'
import evaluation from './core/ThreesixtyCampaign/evaluation'
import report from './core/ThreesixtyCampaign/report'
import autocomplete from './core/temp/autocomplete'
import currentUser from './core/temp/currentUser'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    campaign,
    nomination,
    evaluation,
    report,
    campaigns,
    temp: combineReducers({
      currentUser,
      autocomplete,
    }),
  }),
})
