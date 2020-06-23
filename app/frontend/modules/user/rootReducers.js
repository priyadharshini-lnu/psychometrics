import { combineReducers } from 'redux'
import currentUser from 'core/temp/currentUser'
import preview from 'modules/survey/core/preview'
import reportBuilder from 'modules/reports/core/builder'
import campaign from './core/ThreesixtyCampaign/campaign'
import campaigns from './core/ThreesixtyCampaign/campaigns'
import nomination from './core/ThreesixtyCampaign/nomination'
import evaluation from './core/ThreesixtyCampaign/evaluation'
import assign from './core/ThreesixtyCampaign/assign'
import report from './core/ThreesixtyCampaign/report'
import autocomplete from './core/temp/autocomplete'
import project from './core/temp/project'
import extras from './core/extras'
import checkingWizard from './core/checkingWizard'

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
  report: combineReducers({ builder: reportBuilder }),
  checkingWizard,
})
