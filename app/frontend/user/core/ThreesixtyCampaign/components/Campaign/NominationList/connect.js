import { connect } from 'react-redux'

const mapStateToProps = state => ({
  nominations: state.threeSixtyCampaign.campaign.nominations,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)
