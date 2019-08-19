import { connect } from 'react-redux'
import { fetchCampaign } from 'user/core/ThreesixtyCampaign/campaign'
import {
  getNominations, getEvaluations, getManagedSubjects,
  getApprovalNominations, getSubjectReport, getTotalProgress,
} from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  loaded: state.threeSixtyCampaign.campaign.loaded,
  campaign: state.threeSixtyCampaign.campaign,
  instructions: state.threeSixtyCampaign.campaign.instructions,
  evaluationsCounters: state.threeSixtyCampaign.campaign.evaluationsCounters,
  nominationsCounters: state.threeSixtyCampaign.campaign.nominationsCounters,
  reportsCounters: state.threeSixtyCampaign.campaign.reportsCounters,
  nominations: getNominations(state.threeSixtyCampaign).length
               + getApprovalNominations(state.threeSixtyCampaign).length,
  evaluations: getEvaluations(state.threeSixtyCampaign).length
               + getManagedSubjects(state.threeSixtyCampaign).length,
  reports: state.threeSixtyCampaign.campaign.reports,
  subjectReport: getSubjectReport(state.threeSixtyCampaign),
  totalProgress: getTotalProgress(state.threeSixtyCampaign.campaign),
})

const mapDispatchToProps = {
  fetchCampaign,
}

export default connect(mapStateToProps, mapDispatchToProps)
