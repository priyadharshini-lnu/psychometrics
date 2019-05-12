import { connect } from 'react-redux'

const mapStateToProps = state => ({
  evaluations: state.threeSixtyCampaign.campaign.evaluations,
  options: state.threeSixtyCampaign.campaign.options.relationships,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
