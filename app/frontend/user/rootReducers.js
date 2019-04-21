import { combineReducers } from 'redux'
import campaign from './core/ThreesixtyCampaign/campaign'
import nomination from './core/ThreesixtyCampaign/nomination'
import evaluation from './core/ThreesixtyCampaign/evaluation'
import reports from './core/ThreesixtyCampaign/reports'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    campaign,
    nomination,
    evaluation,
    reports,
  }),
})
