import { connect } from 'react-redux'

const mapStateToProps = state => ({
  nominations: state.threeSixtyCampaign.campaign.nominations,
  options: state.threeSixtyCampaign.campaign.options.relationships,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
