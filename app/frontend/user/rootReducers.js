import { combineReducers } from 'redux'
import campaign from './core/ThreesixtyCampaign/campaign'
import nomination from './core/ThreesixtyCampaign/nomination'
import evaluation from './core/ThreesixtyCampaign/evaluation'
import report from './core/ThreesixtyCampaign/report'
import autocomplete from './core/temp/autocomplete'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    campaign,
    nomination,
    evaluation,
    report,
    temp: combineReducers({
      autocomplete,
    }),
  }),
})
