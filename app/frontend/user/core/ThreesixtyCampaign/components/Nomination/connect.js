import { connect } from 'react-redux'
import {
  fetchNomination,
  removeNomination,
  addNomination,
  updateForm,
  updateStatus,
  showForm,
  hideForm,
} from 'user/core/ThreesixtyCampaign/nomination'
import { searchEvaluators } from 'user/core/temp/autocomplete'
import { requirementsSelector } from 'user/core/ThreesixtyCampaign/nomination/selectors'

const mapStateToProps = state => ({
  nomination: state.threeSixtyCampaign.nomination,
  requirements: requirementsSelector(state.threeSixtyCampaign),
  autocomplete: state.threeSixtyCampaign.temp.autocomplete,
})

const mapDispatchToProps = {
  fetchNomination,
  removeNomination,
  addNomination,
  searchEvaluators,
  updateForm,
  updateStatus,
  showForm,
  hideForm,
}

export default connect(mapStateToProps, mapDispatchToProps)
