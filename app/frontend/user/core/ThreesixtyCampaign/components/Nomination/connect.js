import { connect } from 'react-redux'
import {
  fetchNomination,
  removeNomination,
  addNomination,
} from 'user/core/ThreesixtyCampaign/nomination'

const mapStateToProps = state => ({
  nomination: state.threeSixtyCampaign.nomination,
  subject: state.threeSixtyCampaign.nomination.subject,
})

const mapDispatchToProps = {
  fetchNomination,
  removeNomination,
  addNomination,
}

export default connect(mapStateToProps, mapDispatchToProps)
