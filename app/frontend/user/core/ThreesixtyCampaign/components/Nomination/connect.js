import { connect } from 'react-redux'
import {
  fetchNomination,
  removeNomination,
  addNomination,
} from 'user/core/ThreesixtyCampaign/nomination'
import { searchEvaluators } from 'user/core/temp/autocomplete'

const mapStateToProps = state => ({
  nomination: state.threeSixtyCampaign.nomination,
  subject: state.threeSixtyCampaign.nomination.subject,
  autocomplete: state.threeSixtyCampaign.temp.autocomplete,
})

const mapDispatchToProps = {
  fetchNomination,
  removeNomination,
  addNomination,
  searchEvaluators,
}

export default connect(mapStateToProps, mapDispatchToProps)
