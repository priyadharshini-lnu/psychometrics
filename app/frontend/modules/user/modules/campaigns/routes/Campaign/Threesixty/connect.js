import { connect } from 'react-redux'
import { fetchCampaign, reset as resetCampaign } from 'modules/user/modules/campaigns/core/campaign'
import {
  getNominations, getEvaluations, getManagedSubjects,
  getApprovalNominations, getSubjectReport, getTotalProgress,
} from 'modules/user/modules/campaigns/core/campaign/selectors'

const mapStateToProps = state => ({
  loaded: state.campaigns.campaign.loaded,
  campaign: state.campaigns.campaign,
  instructions: state.campaigns.campaign.instructions,
  evaluationsCounters: state.campaigns.campaign.evaluationsCounters,
  nominationsCounters: state.campaigns.campaign.nominationsCounters,
  reportsCounters: state.campaigns.campaign.reportsCounters,
  nominations: getNominations(state.campaigns).length
               + getApprovalNominations(state.campaigns).length,
  evaluations: getEvaluations(state.campaigns).length
               + getManagedSubjects(state.campaigns).length,
  reports: state.campaigns.campaign.reports,
  subjectReport: getSubjectReport(state.campaigns),
  totalProgress: getTotalProgress(state.campaigns.campaign),
})

const mapDispatchToProps = {
  fetchCampaign,
  resetCampaign,
}

export default connect(mapStateToProps, mapDispatchToProps)
