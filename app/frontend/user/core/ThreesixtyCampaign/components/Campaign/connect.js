import { connect } from 'react-redux'
import { fetchCampaign } from 'user/core/ThreesixtyCampaign/campaign'
import {
  getNominations, getEvaluations, getManagedSubjects,
  getApprovalNominations, getSubjectReport,
} from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  instructions: state.threeSixtyCampaign.campaign.instructions,
  nominations: getNominations(state.threeSixtyCampaign).length
               + getApprovalNominations(state.threeSixtyCampaign).length,
  evaluations: getEvaluations(state.threeSixtyCampaign).length
               + getManagedSubjects(state.threeSixtyCampaign).length,
  reports: state.threeSixtyCampaign.campaign.reports,
  subjectReport: getSubjectReport(state.threeSixtyCampaign),
})

const mapDispatchToProps = {
  fetchCampaign,
}

export default connect(mapStateToProps, mapDispatchToProps)
