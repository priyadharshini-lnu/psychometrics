import { combineReducers } from 'redux'
import currentUser from 'core/temp/currentUser'
import preview from 'libs/survey/core/preview'
import campaign from './core/ThreesixtyCampaign/campaign'
import campaigns from './core/ThreesixtyCampaign/campaigns'
import nomination from './core/ThreesixtyCampaign/nomination'
import evaluation from './core/ThreesixtyCampaign/evaluation'
import assign from './core/ThreesixtyCampaign/assign'
import report from './core/ThreesixtyCampaign/report'
import autocomplete from './core/temp/autocomplete'
import project from './core/temp/project'
import extras from './core/extras'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    campaign,
    nomination,
    evaluation,
    report,
    campaigns,
    assign,
    temp: combineReducers({
      currentUser,
      autocomplete,
      project,
    }),
  }),
  extras,
  preview,
})
