import { combineReducers } from 'redux'
import preview from 'modules/survey/core/preview'
import reportBuilder from 'modules/reports/core/builder'
import currentUser from 'core/currentUser'
import campaign from '../modules/threesixtyCampaign/core/campaign'
import campaigns from '../modules/threesixtyCampaign/core/campaigns'
import nomination from '../modules/threesixtyCampaign/core/nomination'
import evaluation from '../modules/threesixtyCampaign/core/evaluation'
import assign from '../modules/threesixtyCampaign/core/assign'
import report from '../modules/threesixtyCampaign/core/report'
import checkingWizard from '../modules/threesixtyCampaign/core/checkingWizard'
import autocomplete from './ui/autocomplete'
import project from '../modules/threesixtyCampaign/core/project'
import config from './config'

export default combineReducers({
  threeSixtyCampaign: combineReducers({
    campaign,
    nomination,
    evaluation,
    report,
    campaigns,
    assign,
  }),
  ui: combineReducers({
    autocomplete,
  }),
  project,
  currentUser,
  config,
  preview,
  report: combineReducers({ builder: reportBuilder }),
  checkingWizard,
})
