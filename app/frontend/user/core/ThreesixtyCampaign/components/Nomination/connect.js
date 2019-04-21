import { connect } from 'react-redux'
import { fetchNomination } from 'user/core/ThreesixtyCampaign/nomination'

const mapStateToProps = state => ({
  nominations: state.threeSixtyCampaign.campaign.nominations,
  nomination: state.threeSixtyCampaign.nomination,
})

const mapDispatchToProps = {
  fetchNomination,
}

export default connect(mapStateToProps, mapDispatchToProps)
