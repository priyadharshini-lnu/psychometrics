import { connect } from 'react-redux'
import { fetchCampaign } from 'user/core/ThreesixtyCampaign/campaign'

const mapStateToProps = state => ({
  ...state.threeSixtyCampaign.campaign,
})

const mapDispatchToProps = {
  fetchCampaign,
}

export default connect(mapStateToProps, mapDispatchToProps)
