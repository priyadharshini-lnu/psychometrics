import { connect } from 'react-redux'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
