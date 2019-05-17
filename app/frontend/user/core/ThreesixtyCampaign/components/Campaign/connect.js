import { connect } from 'react-redux'
import { fetchCampaign } from 'user/core/ThreesixtyCampaign/campaign'
import {
  getNominations, getEvaluations, getApprovalEvaluations, getApprovalNominations,
} from 'user/core/ThreesixtyCampaign/campaign/selectors'

const mapStateToProps = state => ({
  nominations: getNominations(state.threeSixtyCampaign).length
               + getApprovalNominations(state.threeSixtyCampaign).length,
  evaluations: getEvaluations(state.threeSixtyCampaign).length
               + getApprovalEvaluations(state.threeSixtyCampaign).length,

})

const mapDispatchToProps = {
  fetchCampaign,
}

export default connect(mapStateToProps, mapDispatchToProps)
