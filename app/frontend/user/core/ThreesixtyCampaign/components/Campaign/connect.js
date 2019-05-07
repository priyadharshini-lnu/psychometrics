import { connect } from 'react-redux'
import { fetchCampaign } from 'user/core/ThreesixtyCampaign/campaign'

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  fetchCampaign,
}

export default connect(mapStateToProps, mapDispatchToProps)
