import { connect } from 'react-redux'
import { fetchEvaluation } from 'user/core/ThreesixtyCampaign/evaluation'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
  evaluation: state.threeSixtyCampaign.evaluation,
})

const mapDispatchToProps = {
  fetchEvaluation,
}

export default connect(mapStateToProps, mapDispatchToProps)
