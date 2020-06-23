import { combineReducers } from 'redux'
import preview from 'modules/survey/core/preview'
import reportBuilder from 'modules/reports/core/builder'
import currentUser from 'core/temp/currentUser'
import campaign from '../modules/threesixtyCampaign/core/campaign'
import campaigns from '../modules/threesixtyCampaign/core/campaigns'
import nomination from '../modules/threesixtyCampaign/core/nomination'
import evaluation from '../modules/threesixtyCampaign/core/evaluation'
import assign from '../modules/threesixtyCampaign/core/assign'
import report from '../modules/threesixtyCampaign/core/report'
import checkingWizard from '../modules/threesixtyCampaign/core/checkingWizard'
import autocomplete from './temp/autocomplete'
import project from './temp/project'
import extras from './extras'

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
